using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using server.Configs;
using Microsoft.Build.Framework;
using server.Services.Task;

namespace server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly IComment _commentService;
        private readonly ITasks _taskService;

        public CommentController(IComment commentService, ITasks taskService)
        {
            _commentService = commentService;
            _taskService = taskService;
        }

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetByTaskId(int taskId)
        {
            if (taskId <= 0)
                throw new ErrorException(400, "Invalid task ID.");

            var comments = await _commentService.GetCommentsByTaskIdAsync(taskId);

            if (comments == null || !comments.Any())
                return Ok(new List<CommentDTO>());

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
        [HttpPost("task/{taskId}/project/{projectId}")]
        public async Task<IActionResult> Create([FromBody] CreateCommentDTO dto, int taskId, int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new ErrorException(401, "Unauthorized: Missing user ID.");
            if (taskId <= 0)
                throw new ErrorException(400, "Invalid task ID.");
            var task = await _taskService.GetBasicTasksByTaskId(projectId, taskId);
            if (task == null)
                throw new ErrorException(404, "Task not found to upload file.");
            if (task.IsActive == false)
                throw new ErrorException(400, "Cannot upload comment to an inactive task.");

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