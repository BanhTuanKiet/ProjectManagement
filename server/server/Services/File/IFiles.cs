using server.DTOs;
using server.Models;
using System.Threading.Tasks;
using CloudinaryDotNet.Actions;

namespace server.Services.File
{
    public interface IFiles
    {
        Task<IEnumerable<FileDTO.BasicFile>> GetAllAsync();
        Task<FileDTO.BasicFile?> GetByIdAsync(long id);
        Task<Models.File> UploadFileAsync(IFormFile file, int taskId, string? userId);
        Task<(bool isSuccess, string message)> DeleteFileAsync(int fileId);
        (string? publicId, ResourceType resourceType) ExtractCloudinaryInfo(string fileUrl);
        Task<IEnumerable<FileDTO.BasicFile>> GetFilesByTaskIdAsync(int taskId);
        Task<IEnumerable<FileDTO.BasicFile>> GetFilesByFolderIdAsync(int folderId);
    }
}
