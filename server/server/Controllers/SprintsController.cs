using Microsoft.AspNetCore.Mvc;
using server.DTO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using server.Services.Sprint;
using server.Configs;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
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
            if (dto.EndDate < dto.StartDate)
            {
                ModelState.AddModelError("EndDate", "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
                return BadRequest(ModelState);
            }
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

        [HttpDelete("{projectId}/bulk")]
        public async Task<IActionResult> DeleteSprintBulk(int projectId, [FromBody] List<int> sprintIds)
        {
            Console.WriteLine($"Received sprint IDs for bulk delete: {string.Join(", ", sprintIds)}");
            var result = await _service.DeleteBulk(projectId, sprintIds);

            if (result == 0)
                throw new ErrorException(400, "Bulk delete failed");

            return Ok(new { message = "Bulk deleted successfully" });
        }
    }
}