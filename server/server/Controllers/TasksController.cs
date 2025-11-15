using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using server.DTO;
using server.Models;
using server.Services.Task;
using server.Configs;
using Microsoft.AspNetCore.SignalR;
using AutoMapper;
using server.Services.ActivityLog;

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

        private readonly IMapper _mapper;

        public TasksController(
            ProjectManagementContext context,
            ITasks tasksService,
            INotifications notificationsService,
            IHubContext<NotificationHub> notificationHubContext,
            IHubContext<TaskHubConfig> taskHubContext,
            IActivityLog activityLog,
            IMapper mapper)
        {
            _context = context;
            _tasksService = tasksService;
            _notificationsService = notificationsService;
            _notificationHubContext = notificationHubContext;
            _taskHubContext = taskHubContext;
            _activityLogServices = activityLog;
            _mapper = mapper;
        }

        [HttpGet("user")]
        public async Task<ActionResult> GetTaskByUserId()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tasks = await _tasksService.GetTaskByUserId(userId);
            return Ok(tasks);
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
        public async Task<ActionResult> GetDetailTaskById(int taskId)
        {
            Models.Task task = await _tasksService.GetTaskById(taskId) ?? throw new ErrorException(404, "Task not found");
            return Ok(task);
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPost("view/{projectId}")]
        public async Task<ActionResult> AddTask([FromBody] TaskDTO.NewTaskView newTask, int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string name = User.FindFirst(ClaimTypes.Name)?.Value;
            // var strategy = _context.Database.CreateExecutionStrategy();

            // return await strategy.ExecuteAsync(async () =>
            // {
            //     await using var transaction = await _context.Database.BeginTransactionAsync();
            // try
            // {
            DateTime dateTimeCurrent = DateTime.UtcNow;

            string status;

            DateTime? deadline = null;

            if (!string.IsNullOrEmpty(newTask.Deadline))
            {
                deadline = DateTime.Parse(newTask.Deadline);
            }

            if (deadline == null)
            {
                status = "Todo";
            }
            else
            {
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
                    Link = $"/tasks/{formatedTask.TaskId}",
                    CreatedId = userId,
                    Type = "task"
                };
                TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(addedTask);

                await _notificationsService.SaveNotification(notification);
                await TaskHubConfig.AddedTask(_taskHubContext, projectId, userId, basicTask);
                await NotificationHub.SendTaskAssignedNotification(_notificationHubContext, notification.UserId, notification);
            }
            // await transaction.CommitAsync();

            return Ok(new { message = "Add new task successful!" });
            // }
            // catch (ErrorException ex)
            // {
            //     await transaction.RollbackAsync();
            //     throw new ErrorException(500, ex.Message);
            // }
            // });
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("allbasictasks")]
        public async Task<ActionResult> GetAllBasicTasks()
        {
            List<TaskDTO.BasicTask> tasks = await _tasksService.GetAllBasicTasks();
            return Ok(tasks);
        }
        //sao co toi 2 ham update status
        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("{projectId}/tasks/{taskId}/update")]
        public async Task<IActionResult> PatchTaskField(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            Console.WriteLine("Received updates for task patch aaaaaaaaaaaaaaaaaaaaaaaaaaaaa:", JsonConvert.SerializeObject(updates));
            if (updates == null || !updates.Any())
                throw new ErrorException(400, "Update failed");

            var result = await _tasksService.PatchTaskField(projectId, taskId, updates)
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
            return Ok(new { message = "Update successful" });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpDelete("bulk-delete")]
        public async Task<IActionResult> BulkDelete([FromBody] TaskDTO.BulkDeleteTasksDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            if (dto.Ids == null || !dto.Ids.Any())
            {
                return BadRequest(new { message = "No IDs provided." });
            }

            var deletedCount = await _tasksService.BulkDeleteTasksAsync(dto.ProjectId, dto.Ids);

            foreach (var taskId in dto.Ids)
            {
                Notification notification = new Notification
                {
                    ProjectId = dto.ProjectId,
                    Message = $"Delete task #{taskId} was deleted by {name}",
                    Link = $"/tasks/{taskId}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                    CreatedId = userId,
                    Type = "task"
                };
                await _notificationsService.SaveNotification(notification);
                await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, dto.ProjectId, userId, notification);
            }

            return Ok(new
            {
                message = $"Deleted {deletedCount} tasks.",
                count = deletedCount
            });
        }
        //sao co toi 2 ham update status
        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("{projectId}/{taskId}")]
        public async Task<ActionResult> UpdateStatusTask(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

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
                UserId = null,
                ProjectId = projectId,
                Message = $"Task #{taskId} {task.Title} status was updated from {oldStatus} to {updatedTask.Status} by {name}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = $"/tasks/{taskId}",
                CreatedId = userId,
                Type = "task"
            };

            TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(updatedTask);

            await _notificationsService.SaveNotification(notification);
            await TaskHubConfig.TaskUpdated(_taskHubContext, basicTask);
            await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notification);

            return Ok(new { message = "Update task successful!" });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateDescription/{projectId}/{taskId}")]
        public async Task<ActionResult> UpdateDescriptionTask(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

            if (updates["description"] == "" || updates["description"] == null)
                throw new ErrorException(400, "Update task failed!");

            string oldDescription = task.Description;
            string newDescription = updates["description"]?.ToString() ?? oldDescription;

            Models.Task updatedTask = await _tasksService.UpdateTaskDescription(taskId, newDescription);

            if (updatedTask.Description != newDescription || updatedTask == null)
                throw new ErrorException(400, "Update task failed!");

            Notification notification = new Notification
            {
                UserId = null,
                ProjectId = projectId,
                Message = $"Task #{taskId} {task.Title} description was updated from {oldDescription} to {updatedTask.Description} by {name}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = $"/tasks/{taskId}",
                CreatedId = userId,
                Type = "task"
            };

            TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(updatedTask);

            await _notificationsService.SaveNotification(notification);
            await TaskHubConfig.TaskUpdated(_taskHubContext, basicTask);
            await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notification);

            return Ok(new { message = "Update description successfull!" });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateStartDate/{projectId}/{taskId}")]
        public async Task<ActionResult> UpdateStartDateTask(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

            DateTime? creatAt = task.CreatedAt;
            DateTime? deadline = task.Deadline;
            DateTime? startDate = null;

            if (updates.ContainsKey("createdAt") && updates["createdAt"] != null)
            {
                startDate = DateTime.Parse(updates["createdAt"].ToString());
            }
            if (deadline.HasValue && startDate.HasValue)
            {
                if (deadline.Value.Year < startDate.Value.Year || deadline.Value.Month < startDate.Value.Month ||
                 (deadline.Value.Month == startDate.Value.Month && deadline.Value.Day < startDate.Value.Day) ||
                 (deadline.Value.Day == startDate.Value.Day && deadline.Value.TimeOfDay < startDate.Value.TimeOfDay))
                {
                    throw new ErrorException(400, "Ngày kết thúc không được sớm hơn ngày bắt đầu");
                }
            }

            Models.Task updatedTask = await _tasksService.UpdateTaskStartDate(taskId, startDate);

            if (updatedTask == null)
                throw new ErrorException(400, "Update task failed!");

            Notification notification = new Notification
            {
                UserId = null,
                ProjectId = projectId,
                Message = $"Task #{taskId} {task.Title} start date was updated from {creatAt} to {updatedTask.CreatedAt} by {name}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = $"/tasks/{taskId}",
                CreatedId = userId,
                Type = "task"
            };

            TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(updatedTask);

            await _notificationsService.SaveNotification(notification);
            await TaskHubConfig.TaskUpdated(_taskHubContext, basicTask);
            await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notification);

            return Ok(new { message = "Update start date successfull!" });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateDueDate/{projectId}/{taskId}")]
        public async Task<ActionResult> UpdateDueDateTask(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");
            DateTime? dueDate = task.Deadline;
            DateTime? startDate = task.CreatedAt;
            DateTime? deadline = null;

            if (updates.ContainsKey("deadline") && updates["deadline"] != null)
            {
                deadline = DateTime.Parse(updates["deadline"].ToString());
            }

            if (deadline.HasValue && startDate.HasValue && deadline < startDate)
            {
                throw new ErrorException(400, "Ngày kết thúc không được sớm hơn ngày bắt đầu");
            }

            Models.Task updatedTask = await _tasksService.UpdateTaskDueDate(taskId, deadline);

            if (updatedTask == null)
                throw new ErrorException(400, "Update task failed!");

            Notification notification = new Notification
            {
                UserId = null,
                ProjectId = projectId,
                Message = $"Task #{taskId} {task.Title} due date was updated from {dueDate} to {updatedTask.Deadline} by {name}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = $"/tasks/{taskId}",
                CreatedId = userId,
                Type = "task"
            };

            TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(updatedTask);

            await _notificationsService.SaveNotification(notification);
            await TaskHubConfig.TaskUpdated(_taskHubContext, basicTask);
            await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notification);

            return Ok(new { message = "Update due date successfull!" });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateTitle/{projectId}/{taskId}")]
        public async Task<ActionResult> UpdateTitleTask(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

            if (updates["title"] == "" || updates["title"] == null)
                throw new ErrorException(400, "Update task failed!");

            string oldTitle = task.Description;
            string newTitle = updates["title"]?.ToString() ?? oldTitle;

            Models.Task updatedTask = await _tasksService.UpdateTaskTitle(taskId, newTitle);

            if (updatedTask.Title != newTitle || updatedTask == null)
                throw new ErrorException(400, "Update task failed!");

            Notification notification = new Notification
            {
                UserId = null,
                ProjectId = projectId,
                Message = $"Task #{taskId} {task.Title} title was updated from {oldTitle} to {updatedTask.Title} by {name}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = $"/tasks/{taskId}",
                CreatedId = userId,
                Type = "task"
            };

            TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(updatedTask);

            await _notificationsService.SaveNotification(notification);
            await TaskHubConfig.TaskUpdated(_taskHubContext, basicTask);
            await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notification);

            return Ok(new { message = "Update task title successfull!" });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updatePriority/{projectId}/{taskId}")]
        public async Task<ActionResult> UpdatePriorityTask(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

            if (!updates.TryGetValue("priority", out var priorityObj))
            {
                throw new ErrorException(500, "Missing 'priority' field in request body");
            }

            if (!byte.TryParse(priorityObj?.ToString(), out byte newPriority))
            {
                throw new ErrorException(400, "Invalid priority value");
            }

            byte oldPriority = task.Priority ?? 1;

            Models.Task updatedTask = await _tasksService.UpdateTaskPriority(taskId, newPriority);

            if (updatedTask.Priority != newPriority || updatedTask == null)
                throw new ErrorException(400, "Update task failed!");

            var priorities = new Dictionary<byte, string>
            {
                { 1, "High" },
                { 2, "Medium" },
                { 3, "Low" }
            };

            Notification notification = new Notification
            {
                UserId = null,
                ProjectId = projectId,
                Message = $"Task #{taskId} {task.Title} priority was updated from {priorities[oldPriority]} to {priorities[updatedTask.Priority ?? 1]} by {name}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = $"/tasks/{taskId}",
                CreatedId = userId,
                Type = "task"
            };

            TaskDTO.BasicTask basicTask = _mapper.Map<TaskDTO.BasicTask>(updatedTask);

            await _notificationsService.SaveNotification(notification);
            await TaskHubConfig.TaskUpdated(_taskHubContext, basicTask);
            await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notification);

            return Ok(new { message = "Update task priority successfull!" });
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
        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPost("restore/{taskId}")]
        public async Task<IActionResult> RestoreTask(int taskId)
        {
            try
            {
                var restoredTask = await _tasksService.RestoreTaskFromHistory(taskId);

                // Optional: gửi notification hoặc signalR
                return Ok(new { message = "Restore successful", task = restoredTask });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("{projectId}/filter-by")]
        public async Task<ActionResult> FilterTasks(int projectId, [FromQuery] string? keyword)
        {
            var query = HttpContext.Request.Query;

            if (!query.Any())
                throw new ErrorException(400, "No filters provided");

            // Lưu key/value từ query vào Dictionary
            var filters = query.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToString());

            // Nếu có "me" → thay bằng userId
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

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
            return Ok(result);
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

        // [Authorize(Policy = "PMOrLeaderRequirement")]
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
    }
}