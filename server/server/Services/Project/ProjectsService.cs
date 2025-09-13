using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;

namespace server.Services.Project
{
  public class ProjectsService : IProjects
  {
    public readonly ProjectManagementContext _context;
    private readonly IMapper _mapper;

    public ProjectsService(ProjectManagementContext context, IMapper mapper)
    {
      _context = context;
      _mapper = mapper;
    }

    public async Task<List<ProjectDTO.ProjectTitile>> GetProjectsTitle(string userId)
    {
      List<server.Models.Project> projects = await _context.Projects
          .Include(p => p.CreatedByNavigation)
          .Where(p => p.CreatedBy == userId)
          .ToListAsync();

      return _mapper.Map<List<ProjectDTO.ProjectTitile>>(projects);
    }
  }
}
