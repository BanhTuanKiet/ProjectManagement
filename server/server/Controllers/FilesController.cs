using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using server.Models;
using server.Services.File;
using server.Configs;
using server.Services.ActivityLog;

namespace server.Controllers
{
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("[controller]")]
    public class FilesController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;
        private readonly ProjectManagementContext _context;
        private readonly IFiles _fileService;
        private readonly IActivityLog _activityLogService;

        public FilesController(Cloudinary cloudinary, ProjectManagementContext context, IFiles fileService, IActivityLog activityLogService)
        {
            _cloudinary = cloudinary;
            _context = context;
            _fileService = fileService;
            _activityLogService = activityLogService;
        }

        [HttpPost("upload")]
        [Authorize(Policy = "OnlyAssigneeRequirement", Roles = "LeaderRequirement, PMRequirement")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] int taskId, [FromForm] string projectId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new ErrorException(401, "Unauthorized: missing user ID.");

            if (file == null || file.Length == 0)
                throw new ErrorException(400, "File is missing or empty.");

            if (taskId <= 0)
                throw new ErrorException(400, "Invalid task ID.");

            var uploadedFile = await _fileService.UploadFileAsync(file, taskId, userId) 
                ?? throw new ErrorException(500, "File upload failed.");
            if (uploadedFile != null)
            {
                // Log the file upload activity
                string description = $"Uploaded file '{uploadedFile.FileName}' to task ID {taskId}.";
                await _activityLogService.AddActivityLog(
                    projectId: int.Parse(projectId),
                    userId: userId,
                    action: "Upload File",
                    targetType: "File",
                    targetId: uploadedFile.FileId.ToString(),
                    description: description
                );
            }

            return Ok(uploadedFile);
        }

        [HttpDelete("{fileId}")]
        [Authorize(Policy = "AssigneeRequirement", Roles = "LeaderRequirement, PMRequirement")]

        public async Task<IActionResult> DeleteFile(int fileId, int taskId, int projectId)
        {
            if (fileId <= 0)
                throw new ErrorException(400, "Invalid file ID.");

            var result = await _fileService.DeleteFileAsync(fileId);

            if (!result.isSuccess)
                throw new ErrorException(500, result.message ?? "Failed to delete file.");

            if (result.isSuccess)
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                string description = $"Deleted file ID {fileId} from task ID {taskId}.";
                await _activityLogService.AddActivityLog(
                    projectId: projectId,
                    userId: userId!,
                    action: "Delete File",
                    targetType: "File",
                    targetId: fileId.ToString(),
                    description: description
                );
            }

            return Ok(new { message = result.message });
        }

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetFilesByTaskId(int taskId)
        {
            if (taskId <= 0)
                throw new ErrorException(400, "Invalid task ID.");

            var files = await _fileService.GetFilesByTaskIdAsync(taskId);

            if (files == null || !files.Any())
                return Ok();

            return Ok(files);
        }
    }
}