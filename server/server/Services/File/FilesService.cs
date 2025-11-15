using Microsoft.EntityFrameworkCore;
using server.DTOs;
using server.Models;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace server.Services.File
{
    public class FileServices : IFiles
    {
        private readonly Cloudinary _cloudinary;
        private readonly ProjectManagementContext _context;

        public FileServices(Cloudinary cloudinary, ProjectManagementContext context)
        {
            _cloudinary = cloudinary;
            _context = context;
        }

        public async Task<IEnumerable<FileDTO.BasicFile>> GetAllAsync()
        {
            return await _context.Files
                .OrderByDescending(f => f.UploadedAt)
                .Select(f => new FileDTO.BasicFile
                {
                    FileId = f.FileId,
                    FolderId = f.FolderId,
                    TaskId = f.TaskId,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    FileType = f.FileType,
                    Version = f.Version,
                    IsLatest = f.IsLatest,
                    UploadedBy = f.UploadedBy,
                    UploadedAt = f.UploadedAt
                })
                .ToListAsync();
        }

        public async Task<FileDTO.BasicFile?> GetByIdAsync(long id)
        {
            var file = await _context.Files.FindAsync(id);
            if (file == null) return null;

            return new FileDTO.BasicFile
            {
                FileId = file.FileId,
                FolderId = file.FolderId,
                TaskId = file.TaskId,
                FileName = file.FileName,
                FilePath = file.FilePath,
                FileType = file.FileType,
                Version = file.Version,
                IsLatest = file.IsLatest,
                UploadedBy = file.UploadedBy,
                UploadedAt = file.UploadedAt
            };
        }

        // ✅ UPLOAD FILE
        public async Task<Models.File> UploadFileAsync(IFormFile file, int taskId, string? userId)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file uploaded");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

            ImageUploadResult imageResult = null;
            VideoUploadResult videoResult = null;
            RawUploadResult rawResult = null;

            // Xác định loại upload
            if (new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" }.Contains(ext))
            {
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, file.OpenReadStream()),
                    PublicId = Path.GetFileNameWithoutExtension(file.FileName),
                    Folder = "ProjectManagement/Tasks"
                };
                imageResult = await _cloudinary.UploadAsync(uploadParams);
            }
            else if (new[] { ".mp4", ".mov", ".avi", ".mkv", ".webm" }.Contains(ext))
            {
                var uploadParams = new VideoUploadParams
                {
                    File = new FileDescription(file.FileName, file.OpenReadStream()),
                    PublicId = Path.GetFileNameWithoutExtension(file.FileName),
                    Folder = "ProjectManagement/Tasks"
                };
                videoResult = await _cloudinary.UploadAsync(uploadParams);
            }
            else
            {
                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(file.FileName, file.OpenReadStream()),
                    PublicId = Path.GetFileNameWithoutExtension(file.FileName),
                    Folder = "ProjectManagement/Tasks"
                };
                rawResult = await _cloudinary.UploadAsync(uploadParams);
            }

            // ✅ Lấy URL sau khi upload
            string fileUrl = null;
            if (imageResult != null)
                fileUrl = imageResult.SecureUrl?.ToString() ?? imageResult.Url?.ToString();
            else if (videoResult != null)
                fileUrl = videoResult.SecureUrl?.ToString() ?? videoResult.Url?.ToString();
            else if (rawResult != null)
                fileUrl = rawResult.SecureUrl?.ToString() ?? rawResult.Url?.ToString();

            if (string.IsNullOrEmpty(fileUrl))
                throw new Exception("Upload failed or URL missing.");

            // ✅ Lưu vào DB
            var newFile = new Models.File
            {
                TaskId = taskId,
                FileName = file.FileName,
                FilePath = fileUrl,
                FileType = file.ContentType,
                Version = 1,
                IsLatest = true,
                UploadedBy = userId ?? "unknown",
                UploadedAt = DateTime.UtcNow
            };

            _context.Files.Add(newFile);
            await _context.SaveChangesAsync();

            return newFile;
        }

        public async Task<IEnumerable<FileDTO.BasicFile>> GetFilesByTaskIdAsync(int taskId)
        {
            return await _context.Files
                .Where(f => f.TaskId == taskId)
                .OrderByDescending(f => f.UploadedAt)
                .Select(f => new FileDTO.BasicFile
                {
                    FileId = f.FileId,
                    FolderId = f.FolderId,
                    TaskId = f.TaskId,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    FileType = f.FileType,
                    Version = f.Version,
                    IsLatest = f.IsLatest,
                    UploadedBy = f.UploadedBy,
                    UploadedAt = f.UploadedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<FileDTO.BasicFile>> GetFilesByFolderIdAsync(int folderId)
        {
            return await _context.Files
                .Where(f => f.FolderId == folderId)
                .OrderByDescending(f => f.UploadedAt)
                .Select(f => new FileDTO.BasicFile
                {
                    FileId = f.FileId,
                    FolderId = f.FolderId,
                    TaskId = f.TaskId,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    FileType = f.FileType,
                    Version = f.Version,
                    IsLatest = f.IsLatest,
                    UploadedBy = f.UploadedBy,
                    UploadedAt = f.UploadedAt
                })
                .ToListAsync();
        }

        public async Task<(bool isSuccess, string message)> DeleteFileAsync(int fileId)
        {
            var file = await _context.Files.FirstOrDefaultAsync(f => f.FileId == fileId);
            if (file == null)
                return (false, "File not found");

            try
            {
                var fileUrl = file.FilePath;

                // ✅ Lấy publicId và resourceType
                var (publicId, resourceType) = ExtractCloudinaryInfo(fileUrl);
                if (publicId == null)
                    return (false, "Invalid Cloudinary URL");

                Console.WriteLine($"Deleting file on Cloudinary: publicId={publicId}, resourceType={resourceType}");

                var delParams = new DeletionParams(publicId)
                {
                    ResourceType = resourceType
                };

                var result = await _cloudinary.DestroyAsync(delParams);
                Console.WriteLine($"Cloudinary delete result: {result.Result}, error={result.Error?.Message}");

                if (result.Result == "ok" || result.Result == "not found")
                {
                    _context.Files.Remove(file);
                    await _context.SaveChangesAsync();
                    return (true, "File deleted successfully");
                }

                return (false, $"Failed to delete on Cloudinary: {result.Result}");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return (false, $"Error deleting file: {ex.Message}");
            }
        }

        public (string? publicId, ResourceType resourceType) ExtractCloudinaryInfo(string fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return (null, ResourceType.Raw);

            // ✅ Xác định loại tài nguyên
            var resourceType = ResourceType.Raw;
            if (fileUrl.Contains("/image/upload/")) resourceType = ResourceType.Image;
            else if (fileUrl.Contains("/video/upload/")) resourceType = ResourceType.Video;
            else if (fileUrl.Contains("/raw/upload/")) resourceType = ResourceType.Raw;

            // ✅ Tìm phần sau "/upload/"
            var uploadIndex = fileUrl.IndexOf("/upload/");
            if (uploadIndex == -1)
                return (null, resourceType);

            var afterUpload = fileUrl.Substring(uploadIndex + "/upload/".Length);

            // ✅ Bỏ "v12345/" nếu có
            var parts = afterUpload.Split('/');
            if (parts.Length > 0 && parts[0].StartsWith("v") && long.TryParse(parts[0].Substring(1), out _))
                afterUpload = string.Join("/", parts.Skip(1));

            // ✅ Chính là publicId đầy đủ mà Cloudinary cần
            var publicId = afterUpload;

            return (publicId, resourceType);
        }
    }
}
