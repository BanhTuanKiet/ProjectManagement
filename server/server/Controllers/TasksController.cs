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
        private readonly IHubContext<NotificationHub> _hubContext;
        public TasksController(
            ProjectManagementContext context,
            ITasks tasksService,
            INotifications notificationsService,
            IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _tasksService = tasksService;
            _notificationsService = notificationsService;
            _hubContext = hubContext;
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("{projectId}")]
        public async Task<ActionResult> GetBasicTasksByMonth(int projectId, int? month, int? year, string? filters)
        {
            FilterDTO.FilterCalendarView filterObj = !string.IsNullOrEmpty(filters)
                ? JsonConvert.DeserializeObject<FilterDTO.FilterCalendarView>(filters)
                : new FilterDTO.FilterCalendarView();

            List<TaskDTO.BasicTask> tasks = await _tasksService.GetBasicTasksByMonth(projectId, month, year, filterObj);

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
//xem xet gop lai
        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPost("view/{projectId}")]
        public async Task<ActionResult> AddTaskCalendarView([FromBody] TaskDTO.NewTaskView newTask, int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string name = User.FindFirst(ClaimTypes.Name)?.Value;
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    DateTime dateTimeCurrent = DateTime.UtcNow;
                    DateTime deadline = DateTime.Parse(newTask.Deadline);
                    string status = "";

                    if (dateTimeCurrent.Date == deadline.Date)
                    {
                        status = "InProgress";
                    }
                    else if (dateTimeCurrent.Date < deadline.Date)
                    {
                        throw new ErrorException(400, "Deadline must be after the current date");
                    }
                    else
                    {
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
                        Deadline = dateTimeCurrent
                    };

                    Models.Task addedTask = await _tasksService.AddNewTask(formatedTask);
                    Notification notification = new Notification
                    {
                        UserId = formatedTask.AssigneeId,
                        ProjectId = formatedTask.ProjectId,
                        Message = $"A new task {formatedTask.Title} has been assigned to you by {name}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        Link = $"/tasks/{formatedTask.TaskId}",
                        CreatedId = userId
                    };

                    await _notificationsService.SaveNotification(notification);
                    await NotificationHub.SendTask(_hubContext, notification.UserId, notification);
                    await transaction.CommitAsync();

                    return Ok(new { message = "Add new task successful!" });
                }
                catch (ErrorException ex)
                {
                    await transaction.RollbackAsync();
                    throw new ErrorException(500, ex.Message);
                }
            });
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("allbasictasks")]
        public async Task<ActionResult> GetAllBasicTasks()
        {
            List<TaskDTO.BasicTask> tasks = await _tasksService.GetAllBasicTasks();

            return Ok(tasks);
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPatch("{projectId}/tasks/{taskId}/update")]
        public async Task<IActionResult> PatchTaskField(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            Console.WriteLine("==== PATCH REQUEST START ====");
            Console.WriteLine($"ProjectId: {projectId}, TaskId: {taskId}");

            if (updates != null)
            {
                Console.WriteLine("Updates payload:");
                foreach (var kvp in updates)
                {
                    Console.WriteLine($" - {kvp.Key}: {kvp.Value}");
                }
            }
            else
            {
                Console.WriteLine("No updates received");
            }
            Console.WriteLine("==== PATCH REQUEST END ====");

            if (updates == null || !updates.Any())
                return BadRequest("No updates provided.");

            var result = await _tasksService.PatchTaskField(projectId, taskId, updates);
            if (result == null) return NotFound("Task not found in this project.");

            Console.WriteLine("==== PATCH RESPONSE ====");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result));
            Console.WriteLine("========================");

            return Ok(result);
        }
//xem xet gop lai
        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPost("list/{projectId}")]
        public async Task<ActionResult> AddTaskView([FromRoute] int projectId, [FromBody] TaskDTO.NewTaskListView newTask)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";

            var formatedTask = new Models.Task
            {
                ProjectId = projectId,
                Title = newTask.Title,
                CreatedBy = userId,
                Status = newTask.Status ?? "Todo",
                SprintId = newTask.SprintId,
                BacklogId = newTask.BacklogId
            };

            var addedTask = await _tasksService.AddNewTask(formatedTask);

            return Ok(addedTask);
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
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

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("{projectId}/{taskId}")]
        public async Task<ActionResult> UpdateStatusTask(int taskId, [FromBody] Dictionary<string, object> updates)
        {
            Models.Task task = await _tasksService.GetTaskById(taskId)
                ?? throw new ErrorException(404, "Task not found");

            string newStatus = updates["status"]?.ToString() ?? task.Status;

            Models.Task updatedTask = await _tasksService.UpdateTaskStatus(taskId, newStatus);

            if (updatedTask.Status != newStatus || updatedTask == null)
                throw new ErrorException(400, "Update task failed!");

            return Ok(new { message = "Update task successful!" });
        }
//xem xet gop lai
        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPost("createTask/{projectId}")]
        public async Task<ActionResult> CreateTask([FromBody] TaskDTO.CreateNewTask newTask, int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";

            var formatedTask = new Models.Task
            {
                ProjectId = projectId,
                Title = newTask.Title,
                Description = newTask.Description,
                Status = "In process",
                AssigneeId = newTask.AssigneeId,
                Priority = newTask.Priority,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                Deadline = newTask.Deadline
            };

            Models.Task addedTask = await _tasksService.AddNewTask(formatedTask);

            return Ok(new { message = "Add new task successful!" });
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("{projectId}/filter")]
        public async Task<ActionResult> GetTasksBySprintOrBacklog(
            int projectId,
            [FromQuery] int? sprintId,
            [FromQuery] int? backlogId)
        {
            if (!sprintId.HasValue && !backlogId.HasValue)
                return BadRequest("You must provide at least sprintId or backlogId.");

            var tasks = await _tasksService.GetTasksBySprintOrBacklog(projectId, sprintId, backlogId);
            return Ok(tasks);
        }
    }
}
