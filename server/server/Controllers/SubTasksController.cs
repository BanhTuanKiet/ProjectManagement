using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Models;
using server.Services.SubTask;
using AutoMapper;
using server.Configs;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SubTasksController : ControllerBase
    {
        private readonly ISubTasks _subTasksService;
        private readonly IMapper _mapper;

        public SubTasksController(ISubTasks subTasksService, IMapper mapper)
        {
            _subTasksService = subTasksService;
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubTask([FromBody] SubTaskDTO.CreateSubTask subTask)
        {
            try
            {
                if (subTask == null)
                    throw new ErrorException(400, "Invalid subtask data.");

                Console.WriteLine("Data Đầu vào: ", subTask.Title);
                var subtask = _mapper.Map<Models.SubTask>(subTask);
                Console.WriteLine("Creating subtask: ", subtask);
                var createdSubTask = await _subTasksService.CreateSubTaskAsync(subtask);
                return Ok(createdSubTask);
            }
            catch (ErrorException ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSubTasks()
        {
            try
            {
                var subTasks = await _subTasksService.GetAllSubTasks();
                if (subTasks == null || !subTasks.Any())
                    throw new ErrorException(404, "No subtasks found.");
                return Ok(subTasks);
            }
            catch (ErrorException ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpGet("byTask/{taskId}")]
        public async Task<IActionResult> GetSubTasksByTask(int taskId)
        {
            try
            {
                if (taskId <= 0)
                    throw new ErrorException(400, "Invalid taskId.");

                var subtasks = await _subTasksService.GetSubTasksByTaskIdAsync(taskId);

                if (subtasks == null || !subtasks.Any())
                    throw new ErrorException(404, "No subtasks found for this task.");

                return Ok(subtasks);
            }
            catch (ErrorException ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpPut("{subTaskId}/update")]
        public async Task<IActionResult> UpdateSubTask(int subTaskId, [FromBody] SubTaskDTO.UpdateSubTask dto)
        {
            try
            {
                if (dto == null)
                    throw new ErrorException(400, "Invalid update data.");

                if (subTaskId != dto.SubTaskId)
                    throw new ErrorException(400, "SubTaskId mismatch.");

                var updated = await _subTasksService.UpdateSubTaskAsync(dto);

                if (updated == null)
                    throw new ErrorException(404, "Subtask not found.");

                var result = _mapper.Map<SubTaskDTO.BasicSubTask>(updated);
                return Ok(result);
            }
            catch (ErrorException ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }
    }
}
