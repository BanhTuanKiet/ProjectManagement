using server.DTO;
using YourNamespace.Models;

namespace server.Models
{
    public interface ITeams
    {
        Task<Teams> CreateTeam(string LeaderId);
        Task<List<String>> AddMembers(string leaderId, List<string> memberIds);
        Task<List<string>> GetTeamMembers(string leaderId);
    }
}
