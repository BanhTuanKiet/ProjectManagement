using server.DTO;

namespace server.Models
{
    public interface ITeams
    {
        Task<Teams> CreateTeam(string LeaderId, int projectId);
        Task<List<String>> AddMembers(string leaderId, List<string> memberIds, int projectId);
        Task<List<string>> GetTeamMembers(string leaderId, int projectId);
        Task<List<Teams>> GetAllTeamsInProject(int projectId);
        Task<List<UserDTO.AvailableMember>> FindAvilableMembers(int projectId, string leaderId);
        Task<Teams> GetTeamByLeader(string leaderId, int projectId);
        Task<Teams> GetTeamById(Guid teamId);
        Task<Teams> DemoGetTeamByLeader(int projectId, string leaderId);
    }
}
