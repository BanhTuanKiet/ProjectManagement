using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

  }
}