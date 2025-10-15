using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.DTO;
using server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjects _projectsServices;
        private readonly UserManager<ApplicationUser> _userManager;
        public readonly ProjectManagementContext _context;

        public ProjectsController(IProjects projectsServices, UserManager<ApplicationUser> userManager, ProjectManagementContext context)
        {
            _projectsServices = projectsServices;
            _userManager = userManager;
            _context = context;
        }

        [HttpGet()]
        public async Task<ActionResult> GetProjects()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<ProjectDTO.ProjectBasic> projects = await _projectsServices.GetProjects(userId);
            return Ok(projects);
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("member/{projectId}")]
        public async Task<ActionResult> GetProjectMembers(int projectId)
        {
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
        public async Task<ActionResult> InviteMemberToProject([FromBody] InvitePeopleForm invitePeopleDTO)
        {
            Project project = await _projectsServices.FindProjectById(invitePeopleDTO.ProjectId) ?? throw new ErrorException(500, "Project not found");
            string projectName = project.Name;
            Console.WriteLine("Invitation email sent successfully.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == invitePeopleDTO.ToEmail);
            if (user != null)
            {
                var existingMember = await _context.ProjectMembers
                    .FirstOrDefaultAsync(pm => pm.ProjectId == invitePeopleDTO.ProjectId && pm.UserId == user.Id);

                if (existingMember != null)
                    throw new ErrorException(400, "Tài khoản đã là thành viên của dự án.");
            }

            bool isSuccess = await _projectsServices.InviteMemberToProject(invitePeopleDTO, "trandat2280600642@gmail.com", projectName);
            Console.WriteLine("Invitation email sent successfully 2.");

            if (!isSuccess)
            {
                throw new ErrorException(500, $"Không thể gửi email");
            }

            return Ok(new { message = "Invited member successfully!" });
        }
    }
}