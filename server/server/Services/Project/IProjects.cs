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
        Task<List<ProjectDTO.ProjectMembers>> GetProjectMembersByRole(int projectId, string role, string userId);
        Task<bool> ChangeStatusIsStarred(int projectId, bool isStarred);
        Task<bool> GetStatusIsStarred(int projectId);
        Task<bool> InviteMemberToProject(int projectId, string email, string RoleInProject, string inviterName, string projectName);
        Task<Models.Project> UpdateProject(int projectId, ProjectDTO.UpdateProject update);
        Task<int> CountProject(string ownerId);
        Task<Project> CreateProject(ProjectDTO.CreateProject projectDTO);
        Task<bool> DeleteProject(int project);
        Task<List<ProjectDTO.ProjectMembers>> GetProjectMembers(int projectId);
    }
}
