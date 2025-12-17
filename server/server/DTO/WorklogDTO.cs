using System.ComponentModel.DataAnnotations;

namespace server.DTO
{
    public class WorklogDTO
    {
        public class TaskWorklogDTO
        {
            public long LogId { get; set; }
            public string? Description { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
            public string? UserId { get; set; }
        }
        public class PagedResult<T>
        {
            public List<T> Items { get; set; } = new();
            public int Total { get; set; }
            public int Page { get; set; }
            public int PageSize { get; set; }
        }

    }
}