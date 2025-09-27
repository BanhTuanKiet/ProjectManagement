using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;


namespace server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly IComment _commentService;

        public CommentController(IComment commentService)
        {
            _commentService = commentService;
        }

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetByTaskId(int taskId)
        {
            var comments = await _commentService.GetCommentsByTaskIdAsync(taskId);
            return Ok(comments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var comment = await _commentService.GetByIdAsync(id);
            if (comment == null) return NotFound();
            return Ok(comment);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCommentDTO dto)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var comment = await _commentService.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = comment.CommentId }, comment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateCommentDTO dto)
        {
            var comment = await _commentService.UpdateAsync(id, dto);
            if (comment == null) return NotFound();
            return Ok(comment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var result = await _commentService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
