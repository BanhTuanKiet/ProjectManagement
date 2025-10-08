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
            var userid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

            ImageUploadResult imageResult = null;
            VideoUploadResult videoResult = null;
            RawUploadResult rawResult = null;

            try
            {
                // Choose param type and call correct overload
                if (new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" }.Contains(ext))
                {
                    var p = new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, file.OpenReadStream()),
                        PublicId = Path.GetFileNameWithoutExtension(file.FileName),
                        Folder = "ProjectManagement/Tasks"
                    };
                    imageResult = await _cloudinary.UploadAsync(p);
                }
                else if (new[] { ".mp4", ".mov", ".avi", ".mkv", ".webm" }.Contains(ext))
                {
                    var p = new VideoUploadParams
                    {
                        File = new FileDescription(file.FileName, file.OpenReadStream()),
                        PublicId = Path.GetFileNameWithoutExtension(file.FileName),
                        Folder = "ProjectManagement/Tasks"
                    };
                    videoResult = await _cloudinary.UploadAsync(p);
                }
                else
                {
                    var p = new RawUploadParams
                    {
                        File = new FileDescription(file.FileName, file.OpenReadStream()),
                        PublicId = Path.GetFileNameWithoutExtension(file.FileName),
                        Folder = "ProjectManagement/Tasks"
                        // ResourceType là mặc định cho RawUploadParams => raw
                    };
                    rawResult = await _cloudinary.UploadAsync(p);
                }

                // Lấy URL từ kết quả đúng kiểu
                string fileUrl = null;
                if (imageResult != null)
                    fileUrl = imageResult.SecureUrl?.ToString() ?? imageResult.Url?.ToString();
                else if (videoResult != null)
                    fileUrl = videoResult.SecureUrl?.ToString() ?? videoResult.Url?.ToString();
                else if (rawResult != null)
                    fileUrl = rawResult.SecureUrl?.ToString() ?? rawResult.Url?.ToString();

                if (string.IsNullOrEmpty(fileUrl))
                    return StatusCode(500, "Upload failed or URL missing.");

                // (Tùy chọn) nếu muốn bắt download thay vì preview:
                // if (!fileUrl.Contains("?")) fileUrl += "?fl_attachment";

                var newFile = new server.Models.File
                {
                    TaskId = taskId,
                    FileName = file.FileName,
                    FilePath = fileUrl,
                    FileType = file.ContentType,
                    Version = 1,
                    IsLatest = true,
                    UploadedBy = userid ?? "unknown",
                    UploadedAt = DateTime.UtcNow
                };

                var created = await _fileService.UploadFileAsync(newFile);
                return Ok(created);
            }
            catch (Exception ex)
            {
                // log ex
                Console.WriteLine(ex);
                return StatusCode(500, "Upload exception: " + ex.Message);
            }
        }

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetFilesByTaskId(int taskId)
        {
            var files = await _fileService.GetFilesByTaskIdAsync(taskId);
            if (!files.Any())
                return NotFound("No files found for this task.");

            return Ok(files);
        }

    }
}
