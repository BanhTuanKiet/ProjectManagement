using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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

        [Authorize()]
        [HttpGet()]
        public async Task<ActionResult> GetProjectsTitle()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<ProjectDTO.ProjectTitile> projects =
              await _projectsServices.GetProjectsTitle("user1") ?? throw new ErrorException(500, "Project not found");

            return Ok(projects);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("member/{projectId}")]
        public async Task<ActionResult> GetProjectMembers(int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Project project = await _projectsServices.FindProjectById(projectId) ?? throw new ErrorException(500, "Project not found");

            List<ProjectDTO.ProjectMembers> projectMembers = await _projectsServices.GetProjectMembers(projectId);

            return Ok(projectMembers);
        }

        [HttpPut("starred/{projectId}/{isStarred}")]
        public async Task<ActionResult> ChangeStatusIsStarred(int projectId, bool isStarred)
        {
            await _projectsServices.ChangeStatusIsStarred(projectId, isStarred);
            return NoContent();
        }

        [HttpGet("statusStarred/{projectId}")]
        public async Task<ActionResult> GetStatusIsStarred(int projectId)
        {
            bool isStarred = await _projectsServices.GetStatusIsStarred(projectId);
            return Ok(isStarred);
        }

        [HttpPost("inviteMember/{projectId}")]
        public async Task<ActionResult> SendProjectInviteEmail([FromBody] InvitePeopleForm invitePeopleDTO)
        {
            Project project = await _projectsServices.FindProjectById(invitePeopleDTO.ProjectId) ?? throw new ErrorException(500, "Dự án không tồn tại");
            string projectName = project.Name;
            try
            {
               await _projectsServices.InviteMemberToProject(invitePeopleDTO.ToEmail, "phamtung3328@gmail.com", projectName, invitePeopleDTO.ProjectId);
            }
            catch (Exception ex)
            {
                //throw new ErrorHandlingException(500, $"Không thể gửi email: {ex.Message}");
            }
             return Ok(new { message = "Mời thành viên thành công!" });
        }
    }
}