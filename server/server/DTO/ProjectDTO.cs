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
            public int CountMembers { get; set; }
        }

        public class ProjectMembers
        {
            public string userId { get; set; }
            public string name { get; set; }
            public string role { get; set; }
            public bool isOwner { get; set; }
        }
    }
}