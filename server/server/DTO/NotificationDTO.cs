namespace server.DTO
{
    public class NotificationDTO
    {
        public class NotificationBasic
        {
            public long NotificationId { get; set; }
            public string UserId { get; set; } = null!;
            public int? ProjectId { get; set; }
            public string Message { get; set; } = null!;
            public string? Link { get; set; }
            public bool IsRead { get; set; }
        }
    }
}
