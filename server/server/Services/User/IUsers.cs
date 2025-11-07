namespace server.Models
{
    public interface IUsers
    {
        Task<List<ApplicationUser>> GetUsers();
        Task<string> GetRefreshToken(string userId);
        Task<bool> SaveRefreshToken(string userId, string token);
        Task<ApplicationUser> FindOrCreateUserByEmailAsync(string email, string name);
        Task<bool> CheckLogin(string email, string password);
        Task<List<ProjectInvitations>> GetUserNotRespondedInvitations();
        Task<ApplicationUser> GetUserById(string userId);
        Task<ApplicationUser> UpdateUser(UserDTO.UserProfile user, string userId);
    }
}
