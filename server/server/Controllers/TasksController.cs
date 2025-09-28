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

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("{projectId}")]
        public async Task<ActionResult> GetBasicTasksByMonth(int projectId, int month, int year, string filters)
        {
            FilterDTO.FilterCalendarView filterObj = !string.IsNullOrEmpty(filters)
                ? JsonConvert.DeserializeObject<FilterDTO.FilterCalendarView>(filters)
                : new FilterDTO.FilterCalendarView();

            List<TaskDTO.BasicTask> tasks = await _tasksService.GetBasicTasksByMonth(projectId, month, year, filterObj);

            return Ok(tasks);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("{projectId}/list")]
        public async Task<ActionResult> GetBasicTasksById(int projectId)
        {
            List<TaskDTO.BasicTask> tasks = await _tasksService.GetBasicTasksById(projectId);

            return Ok(tasks);
        }

        [HttpGet("detail/{projectId}/{taskId}")]
        public async Task<ActionResult> GetDetailTaskById(int taskId)
        {
            Models.Task task = await _tasksService.GetTaskById(taskId) ?? throw new ErrorException(404, "Task not found");
            return Ok(task);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("view/{projectId}")]
        public async Task<ActionResult> AddTaskCalendarView([FromBody] TaskDTO.NewTaskView newTask, int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    Models.Task formatedTask = new Models.Task
                    {
                        ProjectId = projectId,
                        Title = newTask.Title,
                        Description = newTask.Description,
                        AssigneeId = newTask.AssigneeId,
                        Priority = newTask.Priority,
                        CreatedBy = userId,
                        Status = "Todo",
                        Deadline = DateTime.Parse(newTask.Deadline)
                    };

                    Models.Task addedTask = await _tasksService.AddNewTask(formatedTask);
                    Notification notification = new Notification
                    {
                        UserId = formatedTask.AssigneeId,
                        ProjectId = formatedTask.ProjectId,
                        Message = $"A new task {formatedTask.Title} has been assigned to you by {formatedTask.CreatedBy}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        Link = $"/tasks/{formatedTask.TaskId}"
                    };

                    await _notificationsService.SaveNotification(notification);
                    await _hubContext.Clients.User(notification.UserId).SendAsync("NotifyTaskAssigned", notification);
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

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("allbasictasks")]
        public async Task<ActionResult> GetAllBasicTasks()
        {
            List<TaskDTO.BasicTask> tasks = await _tasksService.GetAllBasicTasks();

            return Ok(tasks);
        }

        // [HttpPut("{projectId}/tasks/update")]
        // public async Task<IActionResult> UpdateBasicTasksById(
        //     int projectId,
        //     [FromBody] List<TaskDTO.BasicTask> updatedTasks)
        // {
        //     Console.WriteLine("Received tasks for update:", updatedTasks);
        //     Console.WriteLine("Project ID:", projectId);
        //     if (updatedTasks == null || !updatedTasks.Any())
        //         return BadRequest("No tasks provided for update.");

        //     var result = await _tasksService.UpdateBasicTasksById(updatedTasks, projectId);

        //     return Ok(result);
        // }    

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
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

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("list/{projectId}")]
        public async Task<ActionResult> AddTaskView([FromRoute] int projectId, [FromBody] TaskDTO.NewTaskListView newTask)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";

            var formatedTask = new Models.Task
            {
                ProjectId = projectId,
                Title = newTask.Title,
                CreatedBy = userId,
                Status = newTask.Status ?? "Todo"
            };

            var addedTask = await _tasksService.AddNewTask(formatedTask);

            return Ok(addedTask);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
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

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
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

    }
}
