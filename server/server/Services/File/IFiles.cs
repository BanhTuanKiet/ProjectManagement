using server.DTOs;
using server.Models;

namespace server.Services.File
{
    public interface IFiles
    {
        Task<IEnumerable<FileDTO.BasicFile>> GetAllAsync();
        Task<FileDTO.BasicFile?> GetByIdAsync(long id);
        Task<Models.File> UploadFileAsync(Models.File file);
        Task<bool> DeleteFileAsync(long id);
        Task<IEnumerable<FileDTO.BasicFile>> GetFilesByTaskIdAsync(int taskId);
        Task<IEnumerable<FileDTO.BasicFile>> GetFilesByFolderIdAsync(int folderId);
    }
}
