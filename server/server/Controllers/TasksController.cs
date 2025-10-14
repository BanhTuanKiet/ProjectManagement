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
        private readonly IHubContext<TaskHubConfig> _taskHubContext;

        public TasksController(
            ProjectManagementContext context,
            ITasks tasksService,
            INotifications notificationsService,
            IHubContext<NotificationHub> hubContext,
            IHubContext<TaskHubConfig> taskHubContext)
        {
            _context = context;
            _tasksService = tasksService;
            _notificationsService = notificationsService;
            _hubContext = hubContext;
            _taskHubContext = taskHubContext;
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("{projectId}")]
        public async Task<ActionResult> GetBasicTasksByMonth(int projectId, int? month, int? year, string? filters)
        {
            try
            {
                FilterDTO.FilterCalendarView filterObj = !string.IsNullOrEmpty(filters)
                    ? JsonConvert.DeserializeObject<FilterDTO.FilterCalendarView>(filters)
                    : new FilterDTO.FilterCalendarView();

                List<TaskDTO.BasicTask> tasks = new List<TaskDTO.BasicTask>();

                if (month != null && year != null)
                {
                    Console.WriteLine("Use GetBasicTasksByMonth");
                    tasks = await _tasksService.GetBasicTasksByMonth(projectId, month, year, filterObj);
                }
                else
                {
                    Console.WriteLine("Use GetBasicTasksById");
                    tasks = await _tasksService.GetBasicTasksById(projectId);
                }
                return Ok(tasks);
            }
            catch(Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("{projectId}/list")]
        public async Task<ActionResult> GetBasicTasksById(int projectId)
        {
            try
            {
                var tasks = await _tasksService.GetBasicTasksById(projectId);
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
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
                    if (newTask.Deadline == null) 
                        newTask.Deadline = dateTimeCurrent.ToString();
                    DateTime deadline = DateTime.Parse(newTask.Deadline);
                    string status = "Todo";

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
                            CreatedId = userId
                        };
                        Console.WriteLine("UserID in function: " + newTask.AssigneeId);
                        Console.WriteLine("UserID in notification: " + notification.UserId);

                        await _notificationsService.SaveNotification(notification);
                        await NotificationHub.SendTask(_hubContext, notification.UserId, notification);
                    }
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
            try{
                List<TaskDTO.BasicTask> tasks = await _tasksService.GetAllBasicTasks();

                return Ok(tasks);
            } catch (Exception ex){
                throw new ErrorException(500, ex.Message);
            }

        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPatch("{projectId}/tasks/{taskId}/update")]
        public async Task<IActionResult> PatchTaskField(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            try
            {
                if (updates == null || !updates.Any())
                    throw new ErrorException(400, "No updates provided.");
                var result = await _tasksService.PatchTaskField(projectId, taskId, updates);
                if (result == null)
                    throw new ErrorException(404, "Task not found in this project.");                
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpDelete("bulk-delete")]
        public async Task<IActionResult> BulkDelete([FromBody] TaskDTO.BulkDeleteTasksDto dto)
        {
            try
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
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("{projectId}/{taskId}")]
        public async Task<ActionResult> UpdateStatusTask(int projectId, int taskId, [FromBody] Dictionary<string, object> updates)
        {
            try
            {
                Models.Task task = await _tasksService.GetTaskById(taskId)
                    ?? throw new ErrorException(404, "Task not found");

                string newStatus = updates["status"]?.ToString() ?? task.Status;

                Models.Task updatedTask = await _tasksService.UpdateTaskStatus(taskId, newStatus);

                if (updatedTask.Status != newStatus || updatedTask == null)
                    throw new ErrorException(400, "Update task failed!");

                await _taskHubContext.Clients.Group($"project-{projectId}")
                    .SendAsync("TaskUpdated", updatedTask);

                return Ok(new { message = "Update task successful!" });
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("{projectId}/filter")]
        public async Task<ActionResult> GetTasksBySprintOrBacklog(int projectId, [FromQuery] int? sprintId, [FromQuery] int? backlogId)
        {
            try
            {
                if (!sprintId.HasValue && !backlogId.HasValue)
                    throw new ErrorException(400, "You must provide at least sprintId or backlogId.");

                var tasks = await _tasksService.GetTasksBySprintOrBacklog(projectId, sprintId, backlogId);
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }
    }
}
