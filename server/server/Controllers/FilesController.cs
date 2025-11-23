using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using server.Models;
using server.Services.File;
using server.Configs;
using server.Services.ActivityLog;
using server.Services.Task;
using Microsoft.Build.Framework;

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
        private readonly IProjectMember _projectMemberService;
        private readonly ITasks _taskService;
        public FilesController(Cloudinary cloudinary, ProjectManagementContext context, IFiles fileService, IActivityLog activityLogService, IProjectMember projectMemberService, ITasks taskService)
        {
            _cloudinary = cloudinary;
            _context = context;
            _fileService = fileService;
            _activityLogService = activityLogService;
            _projectMemberService = projectMemberService;
            _taskService = taskService;

        }

        [HttpPost("upload/{projectId}")]
        [Authorize]
        // [Authorize(Policy = "AssigneeRequirement", Roles = "LeaderRequirement, PMRequirement, AssigneeRequirement, MemberRequirement")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] int taskId, [FromRoute] int projectId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new ErrorException(401, "Unauthorized: missing user ID.");

            if (file == null || file.Length == 0)
                throw new ErrorException(400, "File is missing or empty.");

            if (taskId <= 0)
                throw new ErrorException(400, "Invalid task ID.");
            var task = await _taskService.GetBasicTasksByTaskId(taskId, projectId);
            if (task == null)
                throw new ErrorException(404, "Task not found to upload file.");
            if(task.IsActive == false)
                throw new ErrorException(400, "Cannot upload file to an inactive task.");
            var member = await _projectMemberService.GetMemberAsync(projectId, userId);
            if (member == null)
            {
                throw new ErrorException(403, "Bạn không phải là thành viên của dự án này.");
            }

            var uploadedFile = await _fileService.UploadFileAsync(file, taskId, userId)
                ?? throw new ErrorException(500, "File upload failed.");

            if (uploadedFile != null)
            {
                // Log the file upload activity
                string description = $"Uploaded file '{uploadedFile.FileName}' to task ID {taskId}.";
                await _activityLogService.AddActivityLog(
                    projectId: projectId,
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
        [Authorize(Policy = "AssigneeRequirement", Roles = "LeaderRequirement, PMRequirement, AssigneeRequirement, MemberRequirement")]
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