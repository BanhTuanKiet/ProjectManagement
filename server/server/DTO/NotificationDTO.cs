namespace server.DTO
{
    public class NotificationDTO
    {
        public class NotificationBasic
        {
            public long NotificationId { get; set; }
            public string AssigneeId { get; set; } = null!;
            public string Assignee { get; set; }
            public string CreatedId { get; set; }
            public string CreatedBy { get; set; }
            public int? ProjectId { get; set; }
            public string Message { get; set; } = null!;
            public string? Link { get; set; }
            public bool IsRead { get; set; }
            public DateTime CreatedAt { get; set; }
        }
    }
}
