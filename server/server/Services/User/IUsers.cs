namespace server.Models
{
    public interface IUsers
    {
        Task<List<ApplicationUser>> GetUsers();
    }
}
