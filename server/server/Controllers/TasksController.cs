using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        [HttpGet("{projectId}")]
        public async Task<ActionResult> GetBasicTasksByMonth(int projectId, int month, int year, string filters)
        {
            FilterDTO.FilterCalendarView filterObj = !string.IsNullOrEmpty(filters)
                ? JsonConvert.DeserializeObject<FilterDTO.FilterCalendarView>(filters)
                : new FilterDTO.FilterCalendarView();

            List<TaskDTO.BasicTask> tasks = await _tasksService.GetBasicTasksByMonth(projectId, month, year, filterObj);

            return Ok(tasks);
        }

        [HttpGet("allbasictasks")]
        public async Task<ActionResult> GetAllBasicTasks()
        {
            List<TaskDTO.BasicTask> tasks = await _tasksService.GetAllBasicTasks();

            return Ok(tasks);
        }
    }
}
