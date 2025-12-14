using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using server.DTO;
using server.Models;
using server.Services.Task;
using server.Configs;
using Microsoft.AspNetCore.SignalR;
using AutoMapper;
using server.Services.ActivityLog;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class TasksController : ControllerBase
    {
        private readonly ProjectManagementContext _context;
        private readonly ITasks _tasksService;
        private readonly INotifications _notificationsService;
        private readonly IHubContext<NotificationHub> _notificationHubContext;
        private readonly IHubContext<TaskHubConfig> _taskHubContext;
        private readonly IActivityLog _activityLogServices;
        private readonly IUsers _usersService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IProjectMember _projectMemberService;
        private readonly ITeams _teamsService;
        private readonly IMapper _mapper;

        public TasksController(
            ProjectManagementContext context,
            ITasks tasksService,
            INotifications notificationsService,
            IHubContext<NotificationHub> notificationHubContext,
            IHubContext<TaskHubConfig> taskHubContext,
            IActivityLog activityLog,
            IUsers usersService,
            UserManager<ApplicationUser> userManager,
            IProjectMember projectMemberService,
            ITeams teamsService,
            IMapper mapper)
        {
            _context = context;
            _tasksService = tasksService;
            _notificationsService = notificationsService;
            _notificationHubContext = notificationHubContext;
            _taskHubContext = taskHubContext;
            _activityLogServices = activityLog;
            _mapper = mapper;
            _usersService = usersService;
            _userManager = userManager;
            _projectMemberService = projectMemberService;
            _teamsService = teamsService;
        }

        [HttpGet("user/{projectId}")]
        public async Task<ActionResult> GetTaskByUserId(int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tasks = await _tasksService.GetTaskByUserId(userId, projectId);
            return Ok(tasks);
        }

        [HttpGet("userRole/{projectId}")]
        public async Task<ActionResult> GetTaskByUserRole(int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var projectMember = await _projectMemberService.GetMemberAsync(projectId, userId);

            if (projectMember == null)
                return Unauthorized(new { message = "You are not a member of this project" });

            string role = projectMember.RoleInProject;

            List<TaskDTO.BasicTask> tasks = new();

            switch (role)
            {
                case "Project Manager":
                    {
                        var allTasks = await _tasksService.GetBasicTasksById(projectId);
                        var leaders = await _projectMemberService.GetLeadersInProject(projectId);
                        var resultTeams = new List<object>();

                        foreach (var leader in leaders)
                        {
                            var team = await _teamsService.GetTeamByLeader(leader.UserId, projectId);

                            if (team == null) continue;

                            resultTeams.Add(new
                            {
                                teamId = team.LeaderId,
                                teamName = team.Leader.UserName,
                            });
                        }

                        return Ok(new
                        {
                            tasks = allTasks,
                            teams = resultTeams
                        });
                    }

                case "Leader":
                    // 1. Lấy team mà Leader đang quản lý
                    var members = await _teamsService.GetTeamMembers(userId, projectId);

                    // 2. Thêm cả leader vào danh sách (để họ xem được task của mình)
                    members.Add(userId);

                    // 3. Lấy task của toàn bộ member trong team
                    tasks = await _tasksService.GetTasksByUserList(projectId, members);
                    break;

                case "Member":
                    // Member -> xem task của chính mình
                    tasks = await _tasksService.GetTaskByUserId(userId, projectId);
                    break;
            }

            return Ok(new { tasks });
        }

        // GET: /tasks/{projectId}/byTeam?teamId=...
        [HttpGet("{projectId}/byTeam")]
        public async Task<ActionResult> GetTasksByTeam(string projectId, [FromQuery] string leaderId)
        {
            if (string.IsNullOrEmpty(leaderId))
            {
                return Ok(new List<TaskDTO.BasicTask>());
            }

            // 4. Lấy Members & Tasks
            var members = await _teamsService.GetTeamMembers(leaderId, int.Parse(projectId));

            if (members == null) members = new List<string>();

            if (!members.Contains(leaderId)) members.Add(leaderId);

            var teamTasks = await _tasksService.GetTasksByUserList(int.Parse(projectId), members);

            Console.WriteLine($"Success: Trả về {teamTasks.Count} tasks.");
            return Ok(teamTasks);
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("{projectId}")]
        public async Task<ActionResult> GetBasicTasksByMonth(int projectId, int? month, int? year, string? filters)
        {
            var filterObj = !string.IsNullOrEmpty(filters)
                ? JsonConvert.DeserializeObject<FilterDTO.FilterCalendarView>(filters)
                : new FilterDTO.FilterCalendarView();

            List<TaskDTO.BasicTask> tasks = (month != null && year != null)
                ? await _tasksService.GetBasicTasksByMonth(projectId, month, year, filterObj)
                : await _tasksService.GetBasicTasksById(projectId);

            return Ok(tasks);
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("{projectId}/list")]
        public async Task<ActionResult> GetBasicTasksById(int projectId)
        {
            List<TaskDTO.BasicTask> tasks = await _tasksService.GetBasicTasksById(projectId);
            return Ok(tasks);
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("detail/{projectId}/{taskId}")]
        public async Task<ActionResult> GetDetailTaskById(int taskId, int projectId)
        {
            var task = await _tasksService.GetBasicTasksByTaskId(projectId, taskId) ?? throw new ErrorException(404, "Task not found");
            return Ok(task);
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPost("view/{projectId}")]
        public async Task<ActionResult> AddTask([FromBody] TaskDTO.NewTaskView newTask, int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string name = User.FindFirst(ClaimTypes.Name)?.Value;

            DateTime dateTimeCurrent = DateTime.UtcNow;
            DateTime? deadline = null;
            string status = "Todo";

            if (!string.IsNullOrEmpty(newTask.Deadline))
            {
                deadline = DateTime.Parse(newTask.Deadline);

                if (deadline.Value.Date < dateTimeCurrent.Date)
                    throw new ErrorException(400, "Deadline must be after the current date");

                if (deadline.Value.Date == dateTimeCurrent.Date)
                    status = "InProgress";
                else
                    status = "Todo";
            }

            Models.Task formatedTask = new Models.Task
            {
                ProjectId = projectId,
                Title = newTask.Title,
                Description = newTask.Description,
                AssigneeId = newTask.AssigneeId,
                SprintId = newTask.SprintId,
                Priority = newTask.Priority,
                CreatedBy = userId,
                Status = status,
                Deadline = deadline,
                BacklogId = newTask.BacklogId,
                CreatedAt = dateTimeCurrent,
            };

            Models.Task addedTask = await _tasksService.AddNewTask(formatedTask);
            await _activityLogServices.AddActivityLog(
                projectId: projectId,
                userId: userId,
                action: "Create_TASK",
                targetType: "TASK",
                targetId: addedTask.TaskId.ToString(),
                description: $"User {name} created task #{addedTask.TaskId} with title: '{addedTask.Title}' in project #{projectId}"
            );

            if (newTask.AssigneeId != null)
            {
                Notification notification = new Notification
                {
                    UserId = formatedTask.AssigneeId,
                    ProjectId = formatedTask.ProjectId,
                    Message = $"A new task {formatedTask.Title} has been assigned to you by {name}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                    Link = $"tasks={formatedTask.TaskId}",
                    CreatedId = userId,
                    Type = "task"
                };
                TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(addedTask);
                NotificationDTO.NotificationBasic notificationBasic = _mapper.Map<NotificationDTO.NotificationBasic>(notification);

                await _notificationsService.SaveNotification(notification);
                await TaskHubConfig.AddedTask(_taskHubContext, projectId, userId, basicTask);
                await NotificationHub.SendTaskAssignedNotification(_notificationHubContext, notification.UserId, notificationBasic);
            }

            return Ok(new { message = "Add new task successful!", addedTask });
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("allbasictasks")]
        public async Task<ActionResult> GetAllBasicTasks()
        {
            List<TaskDTO.BasicTask> tasks = await _tasksService.GetAllBasicTasks();
            return Ok(tasks);
        }
        //sao co toi 2 ham update status
        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("{projectId}/tasks/{taskId}/update")]
        public async Task<IActionResult> PatchTaskField(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var projectMember = await _projectMemberService.GetMemberAsync(projectId, userId);

            if (projectMember == null)
                 throw new ErrorException(400, "You are not a member of this project");

            string role = projectMember.RoleInProject;

            if (updates == null)
                throw new ErrorException(400, "Update failed");

            var result = await _tasksService.PatchTaskField(projectId, taskId, updates, userId, role)
                ?? throw new ErrorException(404, "Task not found");

            var logGenerators = new Dictionary<string, Func<string>>
            {
                ["title"] = () => $"User {name} updated task #{taskId} with title: '{result.Title}' in project #{projectId}",
                ["description"] = () => $"User {name} updated task #{taskId} with description: '{result.Description}' in project #{projectId}",
                ["status"] = () => $"User {name} updated status of task #{taskId} to '{result.Status}' in project #{projectId}",
                ["priority"] = () => $"User {name} updated priority of task #{taskId} to '{result.Priority}' in project #{projectId}",
                ["assigneeid"] = () => $"User {name} changed assignee of task #{taskId} to '{result.AssigneeId}' in project #{projectId}",
                ["deadline"] = () => $"User {name} updated deadline of task #{taskId} to '{result.Deadline}'",
                ["estimatehours"] = () => $"User {name} updated estimated hours of task #{taskId} to '{result.EstimateHours}'",
                ["sprintid"] = () => $"User {name} moved task #{taskId} to sprint '{result.SprintId}'",
                ["backlogid"] = () => $"User {name} moved task #{taskId} to backlog '{result.BacklogId}'",
            };

            foreach (var kvp in updates)
            {
                var key = kvp.Key.ToLower();

                if (logGenerators.ContainsKey(key))
                {
                    string description = logGenerators[key]();

                    await _activityLogServices.AddActivityLog(
                        projectId: projectId,
                        userId: userId,
                        action: "Update_TASK",
                        targetType: "TASK",
                        targetId: taskId.ToString(),
                        description: description
                    );
                }
            }
            return Ok(new { message = "Update successful", task = result });
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpDelete("bulk-delete/{projectId}")]
        public async Task<IActionResult> BulkDelete([FromBody] TaskDTO.BulkDeleteTasksDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            if (dto.Ids == null || !dto.Ids.Any())
            {
                return BadRequest(new { message = "No IDs provided." });
            }

            var tasksToDelete = await _context.Tasks
                .Where(t => dto.Ids.Contains(t.TaskId) && t.ProjectId == dto.ProjectId)
                .Select(t => new { t.TaskId, t.AssigneeId })
                .ToListAsync();

            var deletedCount = await _tasksService.BulkDeleteTasksAsync(dto.ProjectId, dto.Ids);

            foreach (var task in tasksToDelete)
            {
                if (!string.IsNullOrEmpty(task.AssigneeId) && task.AssigneeId != userId)
                {
                    Notification notification = new Notification
                    {
                        UserId = task.AssigneeId, // Lấy từ biến đã lưu
                        ProjectId = dto.ProjectId,
                        Message = $"Delete task #{task.TaskId} was deleted by {name}",
                        Link = $"tasks={task.TaskId}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        CreatedId = userId,
                        Type = "task"
                    };
                    await _notificationsService.SaveNotification(notification);
                    await TaskHubConfig.DeletedTasks(_taskHubContext, dto.Ids);
                    var notificationDto = _mapper.Map<NotificationDTO.NotificationBasic>(notification);
                    await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, dto.ProjectId, userId, notificationDto);
                }
            }

            return Ok(new
            {
                message = $"Deleted {deletedCount} tasks.",
                count = deletedCount
            });
        }
        //sao co toi 2 ham update status
        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("{projectId}/{taskId}")]
        public async Task<ActionResult> UpdateStatusTask(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var assignee = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);

            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

            if (task.Status == "Expried")
                throw new ErrorException(400, "Task is expried!");

            string oldStatus = task.Status;
            string newStatus = updates["status"]?.ToString() ?? task.Status;

            Models.Task updatedTask = await _tasksService.UpdateTaskStatus(taskId, newStatus);

            if (updatedTask.Status != newStatus || updatedTask == null)
                throw new ErrorException(400, "Update task failed!");

            await _activityLogServices.AddActivityLog(
                projectId: projectId,
                userId: userId,
                action: "Update_TASK",
                targetType: "TASK",
                targetId: taskId.ToString(),
                description: $"User {name} updated task #{taskId} with title: '{updatedTask.Title}' in project #{projectId}"
            );
            // await _taskHubContext.Clients.Group($"project-{projectId}")
            // .SendAsync("TaskUpdated", updatedTask);

            Notification notification = new Notification
            {
                UserId = assignee.AssigneeId,
                ProjectId = projectId,
                Message = $"Task #{taskId} {task.Title} status was updated from {oldStatus} to {updatedTask.Status} by {name}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = $"tasks={taskId}",
                CreatedId = userId,
                Type = "task"
            };

            TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(updatedTask);

            await _notificationsService.SaveNotification(notification);
            var notificationDto = _mapper.Map<NotificationDTO.NotificationBasic>(notification);
            await TaskHubConfig.TaskUpdated(_taskHubContext, basicTask);
            await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notificationDto);

            return Ok(new { message = "Update task successful!" });
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateTask/{projectId}/{taskId}")]
        public async Task<ActionResult> UpdateTaskModel(int projectId, int taskId, [FromBody] TaskDTO.UpdateTask updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var assignee = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);

            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

            string changeSummary = $"Task #{taskId}: ";
            bool hasChanges = false;

            if (!string.IsNullOrEmpty(updates.Title) && task.Title != updates.Title)
            {
                string oldTitle = task.Title;
                task.Title = updates.Title;
                changeSummary += $"Title changed from '{oldTitle}' to '{updates.Title}'; ";
                hasChanges = true;
            }

            if (updates.Description != null && task.Description != updates.Description)
            {
                string oldDescription = task.Description;
                task.Description = updates.Description;
                changeSummary += $"Description changed from '{oldDescription}' to '{updates.Description}'; ";
                hasChanges = true;
            }

            if (updates.Priority.HasValue && task.Priority != updates.Priority.Value)
            {
                byte oldPriority = task.Priority ?? 1;
                task.Priority = updates.Priority.Value;

                var priorities = new Dictionary<byte, string>
                {
                    { 1, "High" }, { 2, "Medium" }, { 3, "Low" }
                };

                string oldPName = priorities.GetValueOrDefault(oldPriority, "Unknown");
                string newPName = priorities.GetValueOrDefault(updates.Priority.Value, "Unknown");

                changeSummary += $"Priority changed from '{oldPName}' to '{newPName}'; ";
                hasChanges = true;
            }

            DateTime? newCreatedAt = updates.CreatedAt;
            DateTime? newDeadline = updates.Deadline;

            bool createdAtChanged = newCreatedAt.HasValue && task.CreatedAt != newCreatedAt.Value;
            bool deadlineChanged = newDeadline.HasValue && task.Deadline != newDeadline.Value;

            if (createdAtChanged)
            {
                DateTime? oldCreatedAt = task.CreatedAt;
                task.CreatedAt = newCreatedAt.Value;
                changeSummary += $"Start Date changed from '{oldCreatedAt?.ToString()}' to '{newCreatedAt.Value.ToString()}'; ";
                hasChanges = true;
            }

            if (deadlineChanged)
            {
                DateTime? oldDeadline = task.Deadline;
                task.Deadline = newDeadline.Value;
                changeSummary += $"Deadline changed from '{oldDeadline?.ToString()}' to '{newDeadline.Value.ToString()}'; ";
                hasChanges = true;
            }

            if (task.Deadline < task.CreatedAt)
            {
                throw new ErrorException(400, "Start date cannot be greater than End date");
            }

            changeSummary = changeSummary.TrimEnd(' ', ';');
            Console.WriteLine("Message: ", changeSummary);

            Notification notification = new Notification
            {
                UserId = assignee.AssigneeId,
                ProjectId = projectId,
                Message = $"{changeSummary} by {name}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = $"tasks={taskId}",
                CreatedId = userId,
                Type = "task"
            };

            var notificationResult = await _notificationsService.SaveNotification(notification);
            // if (notificationResult == null)
            //     throw new ErrorException(400, "Notification can not create");
            var notificationDto = _mapper.Map<NotificationDTO.NotificationBasic>(notification);
            Models.Task updatedTask = await _tasksService.UpdateTask(taskId, updates);
            TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(updatedTask);
            await TaskHubConfig.TaskUpdated(_taskHubContext, basicTask);

            await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notificationDto);

            return Ok(new { message = "Update task successfull!" });
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("{projectId}/filter")]
        public async Task<ActionResult> GetTasksBySprintOrBacklog(int projectId, [FromQuery] int? sprintId, [FromQuery] int? backlogId)
        {
            if (!sprintId.HasValue && !backlogId.HasValue)
                throw new ErrorException(400, "You must provide at least sprintId or backlogId.");

            var tasks = await _tasksService.GetTasksBySprintOrBacklog(projectId, sprintId, backlogId);
            return Ok(tasks);
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPost("restore/{projectId}/{taskId}")]
        public async Task<IActionResult> RestoreTask(int projectId, int taskId)
        {
            try
            {
                Models.Task restoredTask = await _tasksService.RestoreTaskFromHistory(taskId);
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var name = User.FindFirst(ClaimTypes.Name)?.Value;
                var assignee = await _context.TaskHistories.FirstOrDefaultAsync(t => t.TaskId == taskId);

                if (projectId <= 0) throw new Exception("Invalid projectId");
                if (string.IsNullOrEmpty(userId)) userId = "system";

                Notification notification = new Notification
                {
                    UserId = assignee.AssigneeId,
                    ProjectId = projectId,
                    Message = $"Restore task-{taskId} {restoredTask.Title} by {name}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                    Link = $"tasks={taskId}",
                    CreatedId = userId,
                    Type = "task"
                };

                // Optional: gửi notification hoặc signalR
                TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(restoredTask);

                await _notificationsService.SaveNotification(notification);
                var notificationDto = _mapper.Map<NotificationDTO.NotificationBasic>(notification);
                await TaskHubConfig.TaskUpdated(_taskHubContext, basicTask);
                await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notificationDto);

                return Ok(new { message = "Restore successful", task = restoredTask });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpDelete("permanent/{projectId}/{taskId}")]
        public async Task<IActionResult> DeleteTaskForever(int projectId, int taskId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var name = User.FindFirst(ClaimTypes.Name)?.Value;

                if (projectId <= 0) throw new Exception("Invalid projectId");
                if (string.IsNullOrEmpty(userId)) userId = "system";

                var historyTaskForDelete = await _context.TaskHistories
                                        .OrderByDescending(t => t.ChangedAt)
                                        .FirstOrDefaultAsync(t => t.TaskId == taskId);

                if (historyTaskForDelete == null)
                {
                    throw new ErrorException(404, "Task history not found for the specified taskId");
                }

                var rowsAffected = await _tasksService.DeleteTaskForeverAsync(taskId);

                var historyTask = await _context.TaskHistories
                                        .OrderByDescending(t => t.ChangedAt)
                                        .ToListAsync();

                if (!string.IsNullOrEmpty(historyTaskForDelete.AssigneeId) && historyTaskForDelete.AssigneeId != userId)
                {
                    Notification notification = new Notification
                    {
                        UserId = historyTaskForDelete.AssigneeId,
                        ProjectId = projectId,
                        Message = $"Task '{historyTaskForDelete.Title}' (#{taskId}) was permanently deleted by {name}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        // Link trỏ về Project dashboard vì Task đã mất vĩnh viễn
                        Link = $"projects={projectId}",
                        CreatedId = userId,
                        Type = "task_deleted"
                    };

                    await _notificationsService.SaveNotification(notification);

                    var notificationDto = _mapper.Map<NotificationDTO.NotificationBasic>(notification);

                    // Gửi realtime thông báo
                    await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notificationDto);
                }
                return Ok(new { message = "Permanently deleted successfully", task = historyTask, rowsAffected } );
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "AssigneeRequirement")]
        [HttpGet("{projectId}/filter-by")]
        public async Task<ActionResult> FilterTasks(int projectId, [FromQuery] string? keyword)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var projectMember = await _projectMemberService.GetMemberAsync(projectId, userId);

            if (projectMember == null)
                return Unauthorized(new { message = "You are not a member of this project" });

            string role = projectMember.RoleInProject;

            var query = HttpContext.Request.Query;

            if (!query.Any())
                throw new ErrorException(400, "No filters provided");

            // Lưu key/value từ query vào Dictionary
            var filters = query.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToString());

            if (filters.ContainsValue("me"))
            {
                foreach (var key in filters.Keys.ToList())
                {
                    Console.WriteLine($"Key AAAAAAAAAAAAAAAAAAAAAAAAAAAA: {key}, Value: {filters[key]}");
                    if (filters[key] == "me")
                        filters[key] = userId;
                }
            }

            var result = await _tasksService.FilterTasks(projectId, filters, keyword);
            var ans = new List<TaskDTO.BasicTask>();

            if (role == "Project Manager")
            {
                return Ok(result);
            }
            if (role == "Leader")
            {
                var members = await _teamsService.GetTeamMembers(userId, projectId);

                foreach (var task in result)
                {
                    if (members.Contains(task.AssigneeId))
                    {
                        ans.Add(task);
                    }
                }
                return Ok(ans);
            }
            foreach (var task in result)
            {
                if (task.AssigneeId == userId)
                {
                    ans.Add(task);
                }
            }
            return Ok(ans);
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("{projectId}/search")]
        public async Task<ActionResult> SearchTasks(int projectId, [FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                throw new ErrorException(400, "Keyword is required");

            var result = await _tasksService.SearchTasks(projectId, keyword);
            return Ok(result);
        }

        [HttpGet("{projectId}/deleted")]
        public async Task<IActionResult> GetAllDeletedTasks(int projectId)
        {
            Console.WriteLine("Fetching all deleted tasks for projectId AAAAAAAAAAAAAAAAAAAAAAAAAAAAA: ", projectId);

            var result = await _tasksService.GetAllDeletedTasksAsync(projectId);

            if (result == null)
                throw new ErrorException(404, "No deleted tasks found.");
            return Ok(result);
        }

        // API 2️⃣: TÌM KIẾM và LỌC các task đã xóa
        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpGet("{projectId}/deleted/search")]
        public async Task<IActionResult> SearchDeletedTasks(int projectId, [FromQuery] string? keyword)
        {
            var query = HttpContext.Request.Query;
            var filters = query.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToString());

            // Xử lý logic cho "me" (giữ nguyên như cũ)
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (filters.ContainsValue("me"))
            {
                foreach (var key in filters.Keys.ToList())
                {
                    if (filters[key] == "me")
                        filters[key] = userId;
                }
            }

            var result = await _tasksService.FilterDeletedTasks(projectId, filters, keyword);
            return Ok(result);
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPost("quick-create/{projectId}")]
        public async Task<ActionResult> QuickCreateTask([FromBody] TaskDTO.QuickCreate dto, int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string userName = User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { message = "Title is required" });

            var newTask = new Models.Task
            {
                ProjectId = projectId,
                Title = dto.Title, // hoặc tách riêng Title/Description nếu FE có 2 input
                Description = null,
                SprintId = dto.SprintId > 0 ? dto.SprintId : null,
                Status = "Todo",
                Priority = 1,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                // BacklogId = dto.SprintId == null ? -1 : null
            };

            var addedTask = await _tasksService.AddNewTask(newTask);

            // 🔔 Gửi thông báo realtime qua SignalR
            var basicTask = _mapper.Map<TaskDTO.BasicTask>(addedTask);
            await TaskHubConfig.AddedTask(_taskHubContext, projectId, userId, basicTask);

            return Ok(new
            {
                message = "✅ Task created successfully",
                task = basicTask
            });
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPatch("{projectId}/tasks/{taskId}/toggle-active")]
        public async Task<IActionResult> ToggleTaskActive(int projectId, int taskId)
        {
            try
            {
                var newStatus = await _tasksService.ToggleTaskStatus(taskId, projectId);
                return Ok(new { message = "Success", isActive = newStatus });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("upcoming/{type}")]
        public async Task<ActionResult> GetUpcomingDeadling(string type)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<TaskDTO.BasicTask> basicTasks = [];

            if (type == "deadline")
            {
                basicTasks = await _tasksService.GetUpcomingDeadline(userId);
            }
            else if (type == "today")
            {
                basicTasks = await _tasksService.GetTaskToday(userId);
            }

            return Ok(basicTasks);
        }

        [HttpGet("near-deadline/{projectId}")]
        public async Task<IActionResult> GetNearDeadline(int projectId)
        {
            // lấy userId từ claim (JWT)
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                throw new ErrorException(404, "Fetch task failed!");

            var tasks = await _tasksService.GetNearDeadlineTasksAsync(projectId, userId);
            if (tasks == null)
                throw new ErrorException(404, "No tasks found!");
            return Ok(tasks);
        }

        [HttpPost("support/{projectId}/{taskId}")]
        public async Task<IActionResult> SendSupportEmail(int projectId, int taskId, [FromBody] TaskDTO.SupportRequestModel model)
        {
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string userName = User?.FindFirst(ClaimTypes.Name)?.Value;

            var senderRole = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.UserId == userId && pm.ProjectId == projectId);

            var role = senderRole?.RoleInProject?.ToLower() ?? "member";
            string toEmail = "";

            if (role != "member")
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == model.AssigneeId);
                toEmail = user.Email;
            }

            if (model == null || string.IsNullOrWhiteSpace(model.Content))
                throw new ErrorException(400, "Content is required");

            var ok = await _tasksService.SendSupportEmailAsync(projectId, taskId, userId, userName, model.Content, toEmail, role);

            if (!ok)
                throw new ErrorException(400, "Send email fail!");

            return Ok(new { message = "Send email successfull!" });
        }

        [HttpPatch("{projectId}/{taskId}/tag/{newTag}")]
        // [Authorize(Policy = "TesterRequirement")]
        public async Task<ActionResult> UpdateTag(int projectId, int taskId, string newTag)
        {
            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

            string taskTagUpdated = await _tasksService.UpdateTag(task, newTag);

            if (taskTagUpdated != newTag) throw new ErrorException(400, $"Task status has been updated to {newTag}");

            return Ok(new { message = "Update task successful" });
        }
    }
}