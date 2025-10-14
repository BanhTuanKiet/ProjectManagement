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
            try{
                var data = await _service.GetAll(projectId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpGet("detail/{sprintId}")]
        public async Task<IActionResult> GetById(int sprintId)
        {
            try
            {
                var sprint = await _service.GetById(sprintId);
                if (sprint == null)
                    throw new ErrorException(404, "Sprint not found");

                return Ok(sprint);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpPost("{projectId}")]
        public async Task<IActionResult> Create(int projectId, [FromBody] SprintDTO.Create dto)
        {
            try
            {
                var sprint = await _service.Create(projectId, dto);
                if (sprint == null)
                    throw new ErrorException(400, "Failed to create sprint");

                return Ok(sprint);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpPut("{sprintId}")]
        public async Task<IActionResult> Update(int sprintId, [FromBody] SprintDTO.Update dto)
        {
            try
            {
                var sprint = await _service.Update(sprintId, dto);
                if (sprint == null)
                    throw new ErrorException(404, "Sprint not found or update failed");

                return Ok(sprint);
            }
            catch (ErrorException ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpDelete("{sprintId}")]
        public async Task<IActionResult> Delete(int sprintId)
        {
            try
            {
                var result = await _service.Delete(sprintId);
                if (!result)
                    throw new ErrorException(404, "Sprint not found or delete failed");

                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }
    }
}
