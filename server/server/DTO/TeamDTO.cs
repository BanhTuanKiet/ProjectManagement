namespace server.DTO
{
    public class TeamDTO
    {
        public class Members
        {
            List<string> MememberIds { get; set; }
        }

        public class Teams
        {
            public string TeamId { get; set; }
            public string LeaderId { get; set; }
            public List<TeamMembers> Members { get; set; } = new();
        }

        public class TeamMembers
        {
            public string TeamName { get; set; }
            public string Avatar { get; set; }
            public string UserId { get; set; }
            public string Email { get; set; }
            public string Name { get; set; }
            public string Role { get; set; }
            public bool IsOwner { get; set; }
            public DateTime JoinedAt { get; set; }
        }

        public class ChangeTeamRequest
        {
            public string NewLeaderId { get; set; }
            public string UserId { get; set; }
        }
    }
}
