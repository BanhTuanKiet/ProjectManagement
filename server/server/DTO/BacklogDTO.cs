namespace server.DTO
{
    public class BacklogDTO
    {
        public class Create
        {
            public int ProjectId { get; set; }
            public string Name { get; set; } = null!;
            public string? Description { get; set; }
            public DateOnly? DueDate { get; set; }
        }

        public class Update
        {
            public string? Name { get; set; }
            public string? Description { get; set; }
            public DateOnly? DueDate { get; set; }
        }

        public class BasicBacklog
        {
            public int BacklogId { get; set; }
            public int ProjectId { get; set; }
            public string Name { get; set; } = null!;
            public string? Description { get; set; }
            public DateOnly? CreatedAt { get; set; }
            public DateOnly? DueDate { get; set; }
        }
    }
}
