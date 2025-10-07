using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services.Sprint;

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
            if (sprint == null) return NotFound();
            return Ok(sprint);
        }

        [HttpPost("{projectId}")]
        public async Task<IActionResult> Create(int projectId, [FromBody] SprintDTO.Create dto)
        {
            var sprint = await _service.Create(projectId, dto);
            return Ok(sprint);
        }

        [HttpPut("{sprintId}")]
        public async Task<IActionResult> Update(int sprintId, [FromBody] SprintDTO.Update dto)
        {
            var sprint = await _service.Update(sprintId, dto);
            if (sprint == null) return NotFound();
            return Ok(sprint);
        }

        [HttpDelete("{sprintId}")]
        public async Task<IActionResult> Delete(int sprintId)
        {
            var result = await _service.Delete(sprintId);
            return result ? Ok(new { message = "Deleted successfully" }) : NotFound();
        }
    }
}
