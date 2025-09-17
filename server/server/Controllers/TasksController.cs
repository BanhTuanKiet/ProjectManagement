using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Framework;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using server.DTO;
using server.Models;
using server.Services.Task;
using static NuGet.Packaging.PackagingConstants;
using static server.DTO.FilterDTO;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly ITasks _tasksService;

        public TasksController(ITasks tasksService)
        {
            _tasksService = tasksService;
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
        [HttpPost("view/{projectId}")]
        public async Task<ActionResult> AddTaskView([FromBody] TaskDTO.NewTaskView newTask, int projectId)
        {
            Console.WriteLine("ADd new task");
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            Models.Task formatedTask = new Models.Task
            {
                ProjectId = projectId,
                Title = newTask.Title,
                Description = newTask.Description,
                AssigneeId = newTask.AssigneeId,
                Priority = newTask.Priority,
                CreatedBy = userId,
                Status = "Todo"
            };

            Models.Task addedTask = await _tasksService.AddNewTaskView(formatedTask);

            return Ok(new { message = "Add new task successful!" });
        }

        [HttpGet("allbasictasks")]
        public async Task<ActionResult> GetAllBasicTasks()
        {
            List<TaskDTO.BasicTask> tasks = await _tasksService.GetAllBasicTasks();

            return Ok(tasks);
        }
    }
}
