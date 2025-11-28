public class Media
{
    public Guid Id { get; set; }
    public string Name { get; set; }

    // Navigation
    public virtual ICollection<Contact> Contacts { get; set; }
}