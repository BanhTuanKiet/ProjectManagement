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
        private readonly IMapper _mapper;

        public TasksController(
            ProjectManagementContext context,
            ITasks tasksService,
            INotifications notificationsService,
            IHubContext<NotificationHub> notificationHubContext,
            IHubContext<TaskHubConfig> taskHubContext,
            IMapper mapper)
        {
            _context = context;
            _tasksService = tasksService;
            _notificationsService = notificationsService;
            _notificationHubContext = notificationHubContext;
            _taskHubContext = taskHubContext;
            _mapper = mapper;
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
            DateTime deadline = DateTime.Parse(newTask.Deadline);
            string status;

            // Nếu không có deadline → để trạng thái mặc định
            if (string.IsNullOrEmpty(newTask.Deadline))
            {
                status = "Todo";
            }
            else
            {
                if (deadline.Date < dateTimeCurrent.Date)
                    throw new ErrorException(400, "Deadline must be after the current date");

                if (deadline.Date == dateTimeCurrent.Date)
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
        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("{projectId}/tasks/{taskId}/update")]
        public async Task<IActionResult> PatchTaskField(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            if (updates == null || !updates.Any())
                throw new ErrorException(400, "Update failed");

            var result = await _tasksService.PatchTaskField(projectId, taskId, updates)
                ?? throw new ErrorException(404, "Task not found");

            return Ok(new { message = "Update successful" });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpDelete("bulk-delete")]
        public async Task<IActionResult> BulkDelete([FromBody] TaskDTO.BulkDeleteTasksDto dto)
        {
            if (dto.Ids == null || !dto.Ids.Any())
            {
                return BadRequest(new { message = "No IDs provided." });
            }

            var deletedCount = await _tasksService.BulkDeleteTasksAsync(dto.ProjectId, dto.Ids);

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

            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

            string oldStatus = task.Status;
            string newStatus = updates["status"]?.ToString() ?? task.Status;

            Models.Task updatedTask = await _tasksService.UpdateTaskStatus(taskId, newStatus);

            if (updatedTask.Status != newStatus || updatedTask == null)
                throw new ErrorException(400, "Update task failed!");

            await _taskHubContext.Clients.Group($"project-{projectId}")
                .SendAsync("TaskUpdated", updatedTask);

            Notification notification = new Notification
            {
                UserId = null,
                ProjectId = projectId,
                Message = $"Task #{taskId} status was updated from {oldStatus} to {updatedTask.Status} by {name}",
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
    }
}