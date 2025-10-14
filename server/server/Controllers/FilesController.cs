using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services;
using System.Security.Claims;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using server.Models;
using Microsoft.EntityFrameworkCore;
using server.Services.File;
using server.Configs;


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

        public FilesController(Cloudinary cloudinary, ProjectManagementContext context, IFiles fileService)
        {
            _cloudinary = cloudinary;
            _context = context;
            _fileService = fileService;
        }

         [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] int taskId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    throw new ErrorException(401, "Unauthorized: missing user ID.");

                if (file == null || file.Length == 0)
                    throw new ErrorException(400, "File is missing or empty.");

                if (taskId <= 0)
                    throw new ErrorException(400, "Invalid task ID.");

                var uploadedFile = await _fileService.UploadFileAsync(file, taskId, userId);

                if (uploadedFile == null)
                    throw new ErrorException(500, "File upload failed.");

                return Ok(uploadedFile);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

        [HttpDelete("{fileId}")]
        public async Task<IActionResult> DeleteFile(int fileId)
        {
            try
            {
                if (fileId <= 0)
                    throw new ErrorException(400, "Invalid file ID.");

                var result = await _fileService.DeleteFileAsync(fileId);

                if (!result.isSuccess)
                    throw new ErrorException(500, result.message ?? "Failed to delete file.");

                return Ok(new { message = result.message });
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }
        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetFilesByTaskId(int taskId)
        {
            try
            {
                if (taskId <= 0)
                    throw new ErrorException(400, "Invalid task ID.");

                var files = await _fileService.GetFilesByTaskIdAsync(taskId);

                if (files == null || !files.Any())
                    throw new ErrorException(404, "No files found for this task.");

                return Ok(files);
            }
            catch (Exception ex)
            {
                throw new ErrorException(500, ex.Message);
            }
        }

    }
}
