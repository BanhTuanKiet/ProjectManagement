namespace server.DTO
{
    public class SubTaskDTO
    {
        public class BasicSubTask
        {
            public int SubTaskId { get; set; }
            public int TaskId { get; set; }
            public string Title { get; set; } = string.Empty;
            public string? Status { get; set; }
            public string? Assignee { get; set; }  // map từ Assignee.UserName
            public DateTime? CreatedAt { get; set; }
        }
        public class CreateSubTask
        {
            public int ProjectId { get; set; }  // để frontend gửi lên
            public int TaskId { get; set; }
            public string Title { get; set; } = null!;
            public string? Status { get; set; }
            public string? AssigneeId { get; set; }
        }
        public class UpdateSubTask
        {
            public int SubTaskId { get; set; }
            public int TaskId { get; set; }
            public string? Summary { get; set; }
            public string? Status { get; set; }
            public int? AssigneeId { get; set; }
        }
    }
}
