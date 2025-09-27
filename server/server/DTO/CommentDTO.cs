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
        public int TaskId { get; set; }
        public string Content { get; set; } = null!;
    }

    public class UpdateCommentDTO
    {
        public string Content { get; set; } = null!;
    }
}
