using server.DTO;

namespace server.Services
{
    public interface IComment
    {
        Task<IEnumerable<CommentDTO>> GetCommentsByTaskIdAsync(int taskId);
        Task<CommentDTO?> GetByIdAsync(long id);
        Task<CommentDTO> CreateAsync(string userId, CreateCommentDTO dto);
        Task<CommentDTO?> UpdateAsync(long id, UpdateCommentDTO dto);
        Task<bool> DeleteAsync(long id);
    }
}
