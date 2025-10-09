using Microsoft.EntityFrameworkCore;
using server.DTOs;
using server.Models;

namespace server.Services.File
{
    public class FileService : IFiles
    {
        private readonly ProjectManagementContext _context;

        public FileService(ProjectManagementContext context)
        {
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

        public async Task<Models.File> UploadFileAsync(Models.File file)
        {
            _context.Files.Add(file);
            await _context.SaveChangesAsync();
            return file;
        }

        public async Task<bool> DeleteFileAsync(long id)
        {
            var file = await _context.Files.FindAsync(id);
            if (file == null) return false;

            _context.Files.Remove(file);
            await _context.SaveChangesAsync();
            return true;
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
    }
}
