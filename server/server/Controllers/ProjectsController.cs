using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.DTO;
using server.Models;
using server.Services.ActivityLog;
using System.Security.Claims;
using System.Text.RegularExpressions;

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
        private readonly IActivityLog _activityLogServices;

        public ProjectsController(IProjects projectsServices, UserManager<ApplicationUser> userManager, ProjectManagementContext context, IActivityLog activityLog)
        {
            _projectsServices = projectsServices;
            _userManager = userManager;
            _context = context;
            _activityLogServices = activityLog;
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
        // [Authorize(Policy = "MemberLimitRequirement")]
        public async Task<ActionResult> InviteMemberToProject([FromBody] UserDTO.InvitePeopleForm invitePeopleForm, int projectId)
        {
            Project project = await _projectsServices.FindProjectById(projectId)
                ?? throw new ErrorException(404, "Project not found");

            string projectName = project.Name;

            List<object> results = new();

            foreach (var person in invitePeopleForm.People)
            {
                string email = person.Email;
                string role = person.Role;

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

                // Nếu user tồn tại -> check đã là member
                if (user != null)
                {
                    var existingMember = await _context.ProjectMembers
                        .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == user.Id);

                    if (existingMember != null)
                    {
                        results.Add(new { email, role, status = "Already a member" });
                        continue;
                    }
                }

                // Gửi mail & tạo lời mời
                bool ok = await _projectsServices.InviteMemberToProject(
                    projectId,
                    email,
                    role,
                    user?.UserName,
                    projectName
                );

                results.Add(new
                {
                    email,
                    role,
                    status = ok ? "Invited" : "Failed to send email"
                });
            }

            return Ok(new { results });
        }

        // [Authorize(Policy = "PMOrLeaderRequirement")]
        [HttpPut("updateProject/{projectId}")]
        public async Task<IActionResult> UpdateProject(int projectId, [FromBody] ProjectDTO.UpdateProject updatedData)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);

            if (project == null)
                return NotFound("Project not found");

            if (updatedData.StartDate.HasValue && updatedData.EndDate.HasValue &&
                updatedData.StartDate.Value > updatedData.EndDate.Value)
            {
                return BadRequest("Start date cannot be greater than End date");
            }

            bool hasChanges = false;

            if (!string.IsNullOrWhiteSpace(updatedData.Title) && updatedData.Title != project.Name)
            {
                project.Name = updatedData.Title.Trim();
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(updatedData.Description) && updatedData.Description != project.Description)
            {
                project.Description = updatedData.Description.Trim();
                hasChanges = true;
            }

            if (updatedData.StartDate.HasValue && updatedData.StartDate.Value != project.StartDate)
            {
                project.StartDate = updatedData.StartDate.Value;
                hasChanges = true;
            }

            if (updatedData.EndDate.HasValue && updatedData.EndDate.Value != project.EndDate)
            {
                project.EndDate = updatedData.EndDate.Value;
                hasChanges = true;
            }

            if (!hasChanges)
                throw new ErrorException(400, "No changes were made");

            await _context.SaveChangesAsync();
            return Ok(new { message = "Update project successfully!!" });
        }

        [HttpPost("createProject")]
        public async Task<ActionResult> CreateProject([FromBody] ProjectDTO.CreateProject projectDTO)
        {
            if (projectDTO.Name == "" || projectDTO.Description == "")
            {
                throw new ErrorException(400, "Name and description cannot be empty");
            }

            if (projectDTO.StartDate.HasValue == false || projectDTO.EndDate.HasValue == false)
            {
                throw new ErrorException(400, "Start date and end date cannot be empty");
            }

            if (projectDTO.StartDate > projectDTO.EndDate)
            {
                throw new ErrorException(400, "Start date must be before end date");
            }

            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            projectDTO.CreatedBy = userId;

            Project createdProject = await _projectsServices.CreateProject(projectDTO);

            return Ok(new
            {
                message = "Create project successful!"
            });
        }

        [HttpPut("leader/{projectId}/{leaderId}/{newLeaderId}")]
        [Authorize(Policy = "PMRequirement")]
        public async Task<ActionResult> ChangeLeader(int projectId, string leaderId, string newLeaderId)
        {
            ApplicationUser leader = await _userManager.FindByIdAsync(leaderId)
                ?? throw new ErrorException(404, "Leader not found");
            ApplicationUser newLeader = await _userManager.FindByIdAsync(newLeaderId)
                ?? throw new ErrorException(404, "New leader not found");

            bool isChanged = await _projectsServices.ChangeLeader(projectId, leaderId, newLeaderId);

            if (!isChanged) throw new ErrorException(400, "Change leader failed");

            return Ok(new { message = "Chang leader successful" });
        }
    }
}