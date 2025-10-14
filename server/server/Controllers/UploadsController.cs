using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using server.Models;
using Microsoft.EntityFrameworkCore;
using server.Configs;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadsController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;
        private readonly ProjectManagementContext _context;

        public UploadsController(Cloudinary cloudinary, ProjectManagementContext context)
        {
            _cloudinary = cloudinary;
            _context = context;
        }

        [HttpPost("upload/{taskId}")]
        public async Task<IActionResult> UploadImage(IFormFile file, int taskId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new ErrorException(401, "User not authenticated");

            if (file == null || file.Length == 0)
                throw new ErrorException(400, "No file uploaded");

            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream)
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult == null || uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                throw new ErrorException(500, "Upload to Cloudinary failed");

            Models.File newFile = new Models.File
            {
                TaskId = taskId,
                FileName = file.FileName,
                FilePath = uploadResult.SecureUrl.ToString(), // URL Cloudinary
                FileType = file.ContentType,
                Version = 1,
                IsLatest = true,
                UploadedBy = userId!,
                UploadedAt = DateTime.UtcNow
            };

            await _context.Files.AddAsync(newFile);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "File uploaded successfully",
                file = newFile
            });
        }

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetFilesByTaskId(int taskId)
        {
            var files = await _context.Files
                .Where(f => f.TaskId == taskId)
                .OrderByDescending(f => f.UploadedAt)
                .ToListAsync();

            if (!files.Any())
                throw new ErrorException(404, "No files found for this task");

            return Ok(files);
        }
    }
}