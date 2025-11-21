using server.DTO;

namespace server.Models
{
    public interface ITeams
    {
        Task<Teams> CreateTeam(string LeaderId);
        Task<List<String>> AddMembers(string leaderId, List<string> memberIds, int projectId);
        Task<List<string>> GetTeamMembers(string leaderId);
        Task<List<Teams>> GetAllTeamsInProject(int projectId);
        Task<Teams> GetTeamByLeader(string leaderId);
        Task<Teams> GetTeamById(Guid teamId);
    }
}
