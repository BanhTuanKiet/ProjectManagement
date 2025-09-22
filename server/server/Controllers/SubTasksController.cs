using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Models;
using server.Services.SubTask;
using AutoMapper;

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
                Console.WriteLine("Data Đầu vào: ", subTask.AssigneeId);
                var subtask = _mapper.Map<Models.SubTask>(subTask);
                Console.WriteLine("Creating subtask: ", subtask);
                // var createdSubTask = await _subTasksService.CreateSubTaskAsync(subtask);
                // return Ok(createdSubTask);
                return Ok("Subtask created successfully");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        [HttpGet]
        public async Task<IActionResult> GetAllSubTasks()
        {
            var subTasks = await _subTasksService.GetAllSubTasks();
            return Ok(subTasks);
        }

        [HttpGet("byTask/{taskId}")]
        public async Task<IActionResult> GetSubTasksByTask(int taskId)
        {
            var subtasks = await _subTasksService.GetSubTasksByTaskIdAsync(taskId);
            Console.WriteLine("Subtasks for TaskId " + taskId + ": " + subtasks);
            return Ok(subtasks);
        }
    }
}
