using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services.Sprint;
using server.Models;
using server.Configs;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SprintsController : ControllerBase
    {
        private readonly ISprints _service;

        public SprintsController(ISprints service)
        {
            _service = service;
        }

        [HttpGet("{projectId}")]
        public async Task<IActionResult> GetAll(int projectId)
        {
            var data = await _service.GetAll(projectId);
            return Ok(data);
        }

        [HttpGet("detail/{sprintId}")]
        public async Task<IActionResult> GetById(int sprintId)
        {
            var sprint = await _service.GetById(sprintId);

            if (sprint == null)
                throw new ErrorException(404, "Sprint not found");

            return Ok(sprint);
        }

        [HttpPost("{projectId}")]
        public async Task<IActionResult> Create(int projectId, [FromBody] SprintDTO.Create dto)
        {
            var sprint = await _service.Create(projectId, dto);

            if (sprint == null)
                throw new ErrorException(400, "Failed to create sprint");

            return Ok(sprint);
        }

        [HttpPut("{sprintId}")]
        public async Task<IActionResult> Update(int sprintId, [FromBody] SprintDTO.Update dto)
        {
            var sprint = await _service.Update(sprintId, dto);

            if (sprint == null)
                throw new ErrorException(404, "Sprint not found or update failed");

            return Ok(sprint);
        }

        [HttpDelete("{sprintId}")]
        public async Task<IActionResult> Delete(int sprintId)
        {
            var result = await _service.Delete(sprintId);

            if (!result)
                throw new ErrorException(404, "Sprint not found or delete failed");

            return Ok(new { message = "Deleted successfully" });
        }
    }
}