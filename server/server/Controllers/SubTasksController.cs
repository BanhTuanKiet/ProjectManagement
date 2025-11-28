using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services.SubTask;
using AutoMapper;
using server.Configs;
using System.Security.Claims;
using server.Services.ActivityLog;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SubTasksController : ControllerBase
    {
        private readonly ISubTasks _subTasksService;
        private readonly IMapper _mapper;
        private readonly IActivityLog _activityLogService;

        public SubTasksController(ISubTasks subTasksService, IMapper mapper, IActivityLog activityLogService)
        {
            _subTasksService = subTasksService;
            _mapper = mapper;
            _activityLogService = activityLogService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubTask([FromBody] SubTaskDTO.CreateSubTask subTask)
        {
            if (subTask == null)
                throw new ErrorException(400, "Invalid subtask data.");

            Console.WriteLine("Data Đầu vào: ", subTask.Title);

            var subtask = _mapper.Map<Models.SubTask>(subTask);
            Console.WriteLine("Creating subtask: ", subtask);
            var createdSubTask = await _subTasksService.CreateSubTaskAsync(subtask);
            if (createdSubTask != null)
            {
                // Log the subtask creation activity
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                string description = $"Created subtask '{createdSubTask.Title}' for task ID {createdSubTask.TaskId}.";
                await _activityLogService.AddActivityLog(
                    projectId: subTask.ProjectId,
                    userId: userId!,
                    action: "Create Subtask",
                    targetType: "Subtask",
                    targetId: createdSubTask.SubTaskId.ToString(),
                    description: description
                );
            }

            return Ok(createdSubTask);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSubTasks()
        {
            var subTasks = await _subTasksService.GetAllSubTasks();

            if (subTasks == null || !subTasks.Any())
                throw new ErrorException(404, "No subtasks found.");
            return Ok(subTasks);
        }

        [HttpGet("byTask/{taskId}")]
        public async Task<IActionResult> GetSubTasksByTask(int taskId)
        {
            if (taskId <= 0)
                throw new ErrorException(400, "Invalid taskId.");

            var subtasks = await _subTasksService.GetSubTasksByTaskIdAsync(taskId);

            // if (subtasks == null || !subtasks.Any())
            //     throw new ErrorException(404, "No subtasks found for this task.");

            return Ok(subtasks);
        }

        [HttpPut("{subTaskId}/update/project/{projectId}")]
        public async Task<IActionResult> UpdateSubTask(int subTaskId, int projectId, [FromBody] SubTaskDTO.UpdateSubTask dto)
        {
            if (dto == null)
                throw new ErrorException(400, "Invalid update data.");

            if (subTaskId != dto.SubTaskId)
                throw new ErrorException(400, "SubTaskId mismatch.");

            var updated = await _subTasksService.UpdateSubTaskAsync(dto);

            if (updated == null)
                throw new ErrorException(404, "Subtask not found.");

            var result = _mapper.Map<SubTaskDTO.BasicSubTask>(updated);
            if (result != null)
            {
                // Log the subtask creation activity
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                string description = $"Created subtask '{result.Title}' for task ID {result.TaskId}.";
                await _activityLogService.AddActivityLog(
                    projectId: projectId,
                    userId: userId!,
                    action: "Create Subtask",
                    targetType: "Subtask",
                    targetId: result.SubTaskId.ToString(),
                    description: description
                );
            }
            return Ok(result);
        }
    }
}