namespace server.DTO
{
    public class TokenDTO
    {
        public class DecodedToken
        {
            public string userId { get; set; }
            public string name { get; set; }
            public List<string> roles { get; set; }
            public string Email { get; set; }
            public string PlanId { get; set; }
            public string PlanName {get; set; }
        }
    }
}
