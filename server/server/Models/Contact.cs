using server.Models;

public class Contact
{
    // Foreign keys
    public string UserId { get; set; }
    public Guid MediaId { get; set; }

    public string Url { get; set; }

    // Navigation
    public virtual ApplicationUser User { get; set; }
    public virtual Media Media { get; set; }
}
