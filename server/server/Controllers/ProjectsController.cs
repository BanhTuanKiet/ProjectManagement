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

        [HttpGet("getProjectBasic/{projectId}")]
        public async Task<ActionResult> GetProjectBasic(int projectId)
        {
            var projects = await _projectsServices.GetProjectBasic(projectId);
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

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateTitle/{projectId}")]
        public async Task<ActionResult> UpdateProjectTitle(int projectId, [FromBody] Dictionary<string, object> updates)
        {
            Project project = await _projectsServices.GetProjectBasic(projectId)
                ?? throw new ErrorException(404, "Project not found");

            if (updates["name"] == "" || updates["name"] == null)
                throw new ErrorException(400, "Update project failed!");

            string oldTitle = project.Name;
            string newTitle = updates["name"]?.ToString() ?? oldTitle;

            Project updatedTask = await _projectsServices.UpdateProjectTitle(projectId, newTitle);

            if (updatedTask.Name != newTitle || updatedTask == null)
                throw new ErrorException(400, "Update project failed!");

            return Ok(new { message = "Update project title successfull!" });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateDescription/{projectId}")]
        public async Task<ActionResult> UpdateProjectDescription(int projectId, [FromBody] Dictionary<string, object> updates)
        {
            Project project = await _projectsServices.GetProjectBasic(projectId)
                ?? throw new ErrorException(404, "Project not found");

            if (updates["description"] == "" || updates["description"] == null)
                throw new ErrorException(400, "Update project failed!");

            string oldDescription = project.Description;
            string newDescription = updates["description"]?.ToString() ?? oldDescription;

            Project updatedTask = await _projectsServices.UpdateProjectDescription(projectId, newDescription);

            if (updatedTask.Description != newDescription || updatedTask == null)
                throw new ErrorException(400, "Update project failed!");

            return Ok(new { message = "Update description successfull!" });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateStartDate/{projectId}")]
        public async Task<ActionResult> UpdateProjectStartDate(int projectId, [FromBody] Dictionary<string, object> updates)
        {
            if (!updates.ContainsKey("startDate") || string.IsNullOrWhiteSpace(updates["startDate"]?.ToString()))
                throw new ErrorException(400, "Start date is required");

            Project updatedProject = await _projectsServices.UpdateProjectStartDate(projectId, updates["startDate"].ToString());

            return Ok(new
            {
                message = "Update start date successful!"
            });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateEndDate/{projectId}")]
        public async Task<ActionResult> UpdateProjectEndDate(int projectId, [FromBody] Dictionary<string, object> updates)
        {
            if (!updates.ContainsKey("endDate") || string.IsNullOrWhiteSpace(updates["endDate"]?.ToString()))
                throw new ErrorException(400, "End date is required");

            Project updatedProject = await _projectsServices.UpdateProjectEndDate(projectId, updates["endDate"].ToString());

            return Ok(new
            {
                message = "Update end date successful!"
            });
        }
    }
}