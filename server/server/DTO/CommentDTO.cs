using System.ComponentModel.DataAnnotations;

namespace server.DTO
{
    public class CommentDTO
    {
        public long CommentId { get; set; }
        public int TaskId { get; set; }
        public string UserId { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public bool IsEdited { get; set; }
        public string? UserName { get; set; }   // để hiển thị thêm thông tin user
    }

    public class CreateCommentDTO
    {
        [Required(ErrorMessage = "Task ID is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Task ID must be a valid positive number.")]
        public int TaskId { get; set; }
        [Required(ErrorMessage = "Comment content is required.")]
        [StringLength(1000, ErrorMessage = "Comment content cannot exceed 1000 characters.")]
        [MinLength(1, ErrorMessage = "Comment content cannot be empty.")]
        [RegularExpression(@"^(?:\s*\S){3,}.*$", ErrorMessage = "Comment must contain at least 3 valid characters.")]
        public string Content { get; set; } = null!;
    }

    public class UpdateCommentDTO
    {
        [Required(ErrorMessage = "Comment content is required.")]
        [StringLength(1000, ErrorMessage = "Comment content cannot exceed 1000 characters.")]
        [MinLength(1, ErrorMessage = "Comment content cannot be empty.")]
        public string Content { get; set; } = null!;
    }
}
