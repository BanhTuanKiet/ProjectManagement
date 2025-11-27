namespace server.DTO
{
    public class MediaDTO
    {
        public class Media
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
        }

        public class Contact
        {
            public Guid MediaId { get; set; }
            public string Url { get; set; }
        }
    }
}