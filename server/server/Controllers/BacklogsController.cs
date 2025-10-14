using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services.Backlog;
using server.Models;
using server.Configs;

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
            try
            {
                var data = await _service.GetAll(projectId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpGet("detail/{backlogId}")]
        public async Task<IActionResult> GetById(int backlogId)
        {
            try
            {
                var backlog = await _service.GetById(backlogId);
                if (backlog == null)
                    throw new ErrorException(404, "Backlog not found");
                return Ok(backlog);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpPost("{projectId}")]
        public async Task<IActionResult> Create(int projectId, [FromBody] BacklogDTO.Create dto)
        {
            try
            {
                var backlog = await _service.Create(projectId, dto);
                if (backlog == null)
                    throw new ErrorException(400, "Failed to create backlog");
                return Ok(backlog);
            }catch(ErrorException ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpPut("{backlogId}")]
        public async Task<IActionResult> Update(int backlogId, [FromBody] BacklogDTO.Update dto)
        {
            try
            {
                var backlog = await _service.Update(backlogId, dto);
                if (backlog == null)
                    throw new ErrorException(404, "Backlog not found or update failed");
                return Ok(backlog);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpDelete("{backlogId}")]
        public async Task<IActionResult> Delete(int backlogId)
        {
            try
            {
                var result = await _service.Delete(backlogId);
                if (!result)
                    throw new ErrorException(404, "Backlog not found or delete failed");

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }
    }
}
