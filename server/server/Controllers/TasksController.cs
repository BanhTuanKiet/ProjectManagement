using System;
using System.Collections.Generic;
using System.Linq;
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
        [HttpGet("{projectId}/list")]
        public async Task<ActionResult> GetBasicTasksById(int projectId)
        {
            List<TaskDTO.BasicTask> tasks = await _tasksService.GetBasicTasksById(projectId);

            return Ok(tasks);
        }

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
        // [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPatch("{projectId}/tasks/{taskId}/update")]
        public async Task<IActionResult> PatchTaskField(
            int projectId,
            int taskId,
            [FromBody] Dictionary<string, object> updates)
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
    }
}
