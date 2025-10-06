namespace server.DTO
{
    public class SprintDTO
    {
        public class Create
        {
            public int ProjectId { get; set; }
            public string Name { get; set; } = null!;
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
        }

        public class Update
        {
            public string? Name { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
        }

        public class BasicSprint
        {
            public int SprintId { get; set; }
            public int ProjectId { get; set; }
            public string Name { get; set; } = null!;
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
        }
    }
}
