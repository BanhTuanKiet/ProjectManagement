namespace server.DTO
{
    public class TaskDTO
    {
        public class NewTaskView
        {
            public string Title { get; set; } = null!;
            public string? Description { get; set; }
            public string AssigneeId { get; set; }
            public byte Priority { get; set; }
            public string? Deadline { get; set; }
        }

        public class CreateNewTask
        {
            public string Title { get; set; } = null!;
            public string? Description { get; set; }
            public string AssigneeId { get; set; }
            public byte Priority { get; set; }
            public DateTime? Deadline { get; set; }
        }

        public class BasicTask
        {
            public int TaskId { get; set; }
            public int ProjectId { get; set; }
            public string Title { get; set; } = null!;
            public string? Description { get; set; }
            public string Status { get; set; } = null!;
            public byte Priority { get; set; }
            public string? AssigneeId { get; set; }
            public string? Assignee { get; set; }
            public string CreatedBy { get; set; } = null!;
            public string? CreatedName { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? Deadline { get; set; }
            public decimal? EstimateHours { get; set; }
        }

        public class NewTaskListView
        {
            public string Title { get; set; } = null!;
            public string Status { get; set; } = null!;
        }
        public class BulkDeleteTasksDto
        {
            public int ProjectId { get; set; }
            public List<int> Ids { get; set; } = new List<int>();
        }
    }
}