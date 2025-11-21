using server.DTO;

namespace server.Models
{
    public interface ITeams
    {
        Task<Teams> CreateTeam(string LeaderId);
        Task<List<String>> AddMembers(string leaderId, List<string> memberIds);
        Task<List<string>> GetTeamMembers(string leaderId);
        Task<List<Teams>> GetAllTeamsInProject(int projectId);
        Task<List<UserDTO.AvailableMember>> FindAvilableMembers(int projectId, string leaderId);
    }
}
