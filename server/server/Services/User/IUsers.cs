namespace server.Models
{
    public interface IUsers
    {
        Task<List<ApplicationUser>> GetUsers();
        Task<string> GetRefreshToken(string userId);
        Task<bool> SaveRefreshToken(string userId, string token);
        Task<ApplicationUser> FindOrCreateUserByEmailAsync(string email, string name);
    }
}
