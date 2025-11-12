using server.DTO;

namespace server.Models
{
    public interface IProjects
    {
        Task<string> GetProjectRole(string userId, int projectId);
        Task<List<ProjectDTO.ProjectTitile>> GetProjectsTitle(string userId);
        Task<List<ProjectDTO.ProjectBasic>> GetProjects(string userId);
        Task<Project> FindProjectById(int projectId);
        Task<Models.Project> GetProjectBasic(int projectId);
        Task<List<ProjectDTO.ProjectMembers>> GetProjectMembers(int projectId);
        Task<bool> ChangeStatusIsStarred(int projectId, bool isStarred);
        Task<bool> GetStatusIsStarred(int projectId);
        Task<bool> InviteMemberToProject(InvitePeopleForm invitePeopleDTO, string inviterName, string projectName);
        Task<Project> UpdateProjectTitle(int projectId, string title);
        Task<Project> UpdateProjectDescription(int projectId, string description);
        Task<Project> UpdateProjectStartDate(int projectId, string startDate);
        Task<Project> UpdateProjectEndDate(int projectId, string endDate);
        Task<int> CountProject(string ownerId);
    }
}
