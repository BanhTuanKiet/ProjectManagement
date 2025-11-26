using server.DTO;

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
        Task<ApplicationUser> FindUserById(string id);
        Task<List<ApplicationUser>> FindUserListByIds(List<string> ids);
        Task<ApplicationUser> GetUserById(string userId);
        Task<UserDTO.UserProfile> UpdateUser(UserDTO.UserProfile user, string userId);
        Task<UserDTO.UserProfile> UpdateUserImage(IFormFile file, string userId, string type);
        // Task<List<ProjectDTO.ProjectMembers>> GetMembersTeam(string leaderId);
        Task<ProjectMember> GetProjectRole(int projectId, string userId);
        Task<bool> DeleteMembers(int projectId, List<string> userIds);
        Task<Subscriptions> GetSubscriptions(string userId);
        Task<UserDTO.UserProfile2> GetUserProfile(string userId);
    }
}
