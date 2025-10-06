using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services.Backlog;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class BacklogsController : ControllerBase
    {
        private readonly IBacklogs _service;

        public BacklogsController(IBacklogs service)
        {
            _service = service;
        }

        [HttpGet("{projectId}")]
        public async Task<IActionResult> GetAll(int projectId)
        {
            var data = await _service.GetAll(projectId);
            return Ok(data);
        }

        [HttpGet("detail/{backlogId}")]
        public async Task<IActionResult> GetById(int backlogId)
        {
            var backlog = await _service.GetById(backlogId);
            if (backlog == null) return NotFound();
            return Ok(backlog);
        }

        [HttpPost("{projectId}")]
        public async Task<IActionResult> Create(int projectId, [FromBody] BacklogDTO.Create dto)
        {
            var backlog = await _service.Create(projectId, dto);
            return Ok(backlog);
        }

        [HttpPut("{backlogId}")]
        public async Task<IActionResult> Update(int backlogId, [FromBody] BacklogDTO.Update dto)
        {
            var backlog = await _service.Update(backlogId, dto);
            if (backlog == null) return NotFound();
            return Ok(backlog);
        }

        [HttpDelete("{backlogId}")]
        public async Task<IActionResult> Delete(int backlogId)
        {
            var result = await _service.Delete(backlogId);
            return result ? Ok(new { message = "Deleted successfully" }) : NotFound();
        }
    }
}
