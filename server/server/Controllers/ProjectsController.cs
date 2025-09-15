using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.DTO;
using server.Models;

namespace server.Controllers
{
  [Route("[controller]")]
  [ApiController]
  public class ProjectsController : ControllerBase
  {
    private readonly IProjects _projectsServices;

    public ProjectsController(IProjects projectsServices)
    {
      _projectsServices = projectsServices;
    }

    [HttpGet()]
    public async Task<ActionResult> GetProjectsTitle()
    {
      List<ProjectDTO.ProjectTitile> projects =
        await _projectsServices.GetProjectsTitle("user1") ?? throw new ErrorException(500, "Project not found");

      return Ok(projects);
    }
  }
}