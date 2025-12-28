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

            string cloudinaryMessage = "";

            try
            {
                var fileUrl = file.FilePath;

                // 1. Cố gắng xóa trên Cloudinary (nhưng không để nó chặn việc xóa DB)
                var (publicId, resourceType) = ExtractCloudinaryInfo(fileUrl);

                if (!string.IsNullOrEmpty(publicId))
                {
                    // Xử lý publicId cho Image/Video: Cloudinary lưu ID không có đuôi mở rộng (.jpg, .png)
                    // Nếu là Raw (PDF, Doc, v.v) thì cần giữ nguyên đuôi.
                    if (resourceType == ResourceType.Image || resourceType == ResourceType.Video)
                    {
                        // Loại bỏ đuôi file (extension) khỏi publicId nếu có
                        if (Path.HasExtension(publicId))
                        {
                            publicId = Path.ChangeExtension(publicId, null);
                        }
                    }

                    var delParams = new DeletionParams(publicId)
                    {
                        ResourceType = resourceType
                    };

                    var result = await _cloudinary.DestroyAsync(delParams);
                    cloudinaryMessage = $"Cloudinary result: {result.Result}";

                    // Log kết quả để debug nhưng không return false ở đây
                    Console.WriteLine(cloudinaryMessage);
                }
            }
            catch (Exception ex)
            {
                // Chỉ log lỗi Cloudinary, không chặn luồng xóa DB
                Console.WriteLine($"Error deleting from Cloudinary: {ex.Message}");
                cloudinaryMessage = "Cloudinary deletion failed or skipped.";
            }

            // 2. QUAN TRỌNG: Luôn thực hiện xóa trong Database
            try
            {
                _context.Files.Remove(file);
                await _context.SaveChangesAsync();

                return (true, "File deleted successfully. " + cloudinaryMessage);
            }
            catch (Exception ex)
            {
                return (false, $"Database delete failed: {ex.Message}");
            }
        }

        public (string? publicId, ResourceType resourceType) ExtractCloudinaryInfo(string fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return (null, ResourceType.Raw);

            // Xác định ResourceType (Giữ nguyên logic của bạn)
            var resourceType = ResourceType.Raw;
            if (fileUrl.Contains("/image/upload/")) resourceType = ResourceType.Image;
            else if (fileUrl.Contains("/video/upload/")) resourceType = ResourceType.Video;
            else if (fileUrl.Contains("/raw/upload/")) resourceType = ResourceType.Raw;

            // Tìm vị trí bắt đầu publicId
            var uploadIndex = fileUrl.IndexOf("/upload/");
            if (uploadIndex == -1) return (null, resourceType);

            // Cắt bỏ phần domain và /upload/
            var afterUpload = fileUrl.Substring(uploadIndex + "/upload/".Length);

            // Lọc bỏ query string nếu có (?)
            var queryIndex = afterUpload.IndexOf('?');
            if (queryIndex != -1)
            {
                afterUpload = afterUpload.Substring(0, queryIndex);
            }

            // Xử lý version (v123456/)
            var parts = afterUpload.Split('/');
            if (parts.Length > 0 && parts[0].StartsWith("v") && parts[0].Length > 1 && char.IsDigit(parts[0][1]))
            {
                afterUpload = string.Join("/", parts.Skip(1));
            }

            // Decode URL (phòng trường hợp tên file có dấu cách %20)
            var publicId = System.Net.WebUtility.UrlDecode(afterUpload);

            return (publicId, resourceType);
        }
    }
}
