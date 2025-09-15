namespace server.DTO
{
    public class TokenDTO
    {
        public class DecodedToken
        {
            public string userId { get; set; }
            public List<string> roles { get; set; }
        }
    }
}
