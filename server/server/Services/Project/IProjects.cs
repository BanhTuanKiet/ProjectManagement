using server.DTO;

namespace server.Models
{
  public interface IProjects
  {
    Task<string> GetProjectRole(string userId, int projectId);
    Task<List<ProjectDTO.ProjectTitile>> GetProjectsTitle(string userId);
    Task<Project> FindProjectById(int projectId);
    Task<List<ProjectDTO.ProjectMembers>> GetProjectMembers(int projectId);
  }
}
