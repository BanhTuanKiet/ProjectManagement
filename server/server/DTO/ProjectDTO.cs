namespace server.DTO
{
    public class ProjectDTO
    {
        public class ProjectTitile
        {
            public int ProjectId { get; set; }
            public string Name { get; set; } = null!;
            public bool IsStarred { get; set; }
        }

        public class ProjectBasic
        {
            public int ProjectId { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
            public string OwnerId { get; set; }
            public string Owner { get; set; }
            public List<ProjectMembers> Members { get; set; } = new();
        }

        public class ProjectMembers
        {
            public string userId { get; set; }
            public string name { get; set; }
            public string role { get; set; }
            public bool isOwner { get; set; }
            public DateTime joinedAt { get; set; }
        }

        public class CreateProject
        {
            public string Name { get; set; }
            public string Description { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
            public string CreatedBy { get; set; }
        }

        public class UpdateProject
        {
            public string? Title { get; set; }
            public string? Description { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
        }
    }
}