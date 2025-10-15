using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using server.Configs;

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
            if (taskId <= 0)
                throw new ErrorException(400, "Invalid task ID.");

            var comments = await _commentService.GetCommentsByTaskIdAsync(taskId);

            if (comments == null || !comments.Any())
                throw new ErrorException(404, "No comments found for this task.");

            return Ok(comments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            if (id <= 0)
                throw new ErrorException(400, "Invalid comment ID.");

            var comment = await _commentService.GetByIdAsync(id);

            if (comment == null)
                throw new ErrorException(404, "Comment not found.");

            return Ok(comment);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCommentDTO dto)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new ErrorException(401, "Unauthorized: Missing user ID.");

            if (dto == null)
                throw new ErrorException(400, "Invalid comment data.");

            var comment = await _commentService.CreateAsync(userId, dto);

            if (comment == null)
                throw new ErrorException(500, "Failed to create comment.");

            return CreatedAtAction(nameof(GetById), new { id = comment.CommentId }, comment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateCommentDTO dto)
        {
            if (id <= 0)
                throw new ErrorException(400, "Invalid comment ID.");

            if (dto == null)
                throw new ErrorException(400, "Invalid update data.");

            var comment = await _commentService.UpdateAsync(id, dto);

            if (comment == null)
                throw new ErrorException(404, "Comment not found.");

            return Ok(comment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            if (id <= 0)
                throw new ErrorException(400, "Invalid comment ID.");

            var result = await _commentService.DeleteAsync(id);

            if (!result)
                throw new ErrorException(404, "Comment not found or already deleted.");

            return NoContent();
        }
    }
}