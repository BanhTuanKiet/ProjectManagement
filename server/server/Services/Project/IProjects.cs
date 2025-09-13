using server.DTO;

namespace server.Models
{
  public interface IProjects
  {
    Task<List<ProjectDTO.ProjectTitile>> GetProjectsTitle(string userId);
  }
}
