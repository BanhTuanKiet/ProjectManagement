using server.DTO;

namespace server.Models
{
  public interface IProjects
  {
    Task<string> GetProjectRole(string userId, int projectId);
    Task<List<ProjectDTO.ProjectTitile>> GetProjectsTitle(string userId);
    Task<Project> FindProjectById(int projectId);
    Task<List<ProjectDTO.ProjectMembers>> GetProjectMembers(int projectId);
    Task<bool> ChangeStatusIsStarred(int projectId, bool isStarred);
    Task<bool> GetStatusIsStarred(int projectId);
    Task<bool> InviteMemberToProject(string toEmail, string inviterName, string projectName, int projectId);
  }
}
