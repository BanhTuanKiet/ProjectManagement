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
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var uploadedFile = await _fileService.UploadFileAsync(file, taskId, userId);
                return Ok(uploadedFile);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{fileId}")]
        public async Task<IActionResult> DeleteFile(int fileId)
        {
            try
            {
                var result = await _fileService.DeleteFileAsync(fileId);
                if (!result.isSuccess)
                    return StatusCode(500, new { message = result.message });

                return Ok(new { message = result.message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
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
