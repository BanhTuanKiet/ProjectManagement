using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;
using server.Services.Task;
namespace server.Services.Comment
{
    public class CommentService : IComment
    {
        private readonly ProjectManagementContext _context;

        public CommentService(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CommentDTO>> GetCommentsByTaskIdAsync(int taskId)
        {
            return await _context.Comments
                .Where(c => c.TaskId == taskId)
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDTO
                {
                    CommentId = c.CommentId,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    IsEdited = c.IsEdited,
                    UserName = c.User.UserName
                })
                .ToListAsync();
        }

        public async Task<CommentDTO?> GetByIdAsync(long id)
        {
            var c = await _context.Comments
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.CommentId == id);

            if (c == null) return null;

            return new CommentDTO
            {
                CommentId = c.CommentId,
                TaskId = c.TaskId,
                UserId = c.UserId,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                IsEdited = c.IsEdited,
                UserName = c.User.UserName
            };
        }

        public async Task<CommentDTO> CreateAsync(String UserId, CreateCommentDTO dto)
        {
            var comment = new Models.Comment
            {
                TaskId = dto.TaskId,
                UserId = UserId,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow,
                IsEdited = false
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(comment.CommentId) ?? throw new Exception("Create failed");
        }

        public async Task<CommentDTO?> UpdateAsync(long id, UpdateCommentDTO dto)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return null;

            comment.Content = dto.Content;
            comment.IsEdited = true;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(comment.CommentId);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return false;

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
