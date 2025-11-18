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
        public async Task<ActionResult> InviteMemberToProject([FromBody] InvitePeopleForm invitePeopleDTO, int projectId)
        {
            if (invitePeopleDTO.ToEmail == "" || invitePeopleDTO.ToEmail == null)
            {
                throw new ErrorException(400, "Email cannot be empty");
            }
            else
            {
                var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
                if (!emailRegex.IsMatch(invitePeopleDTO.ToEmail))
                {
                    throw new ErrorException(400, "Invalid email");
                }
            }

            Project project = await _projectsServices.FindProjectById(invitePeopleDTO.ProjectId) ?? throw new ErrorException(500, "Project not found");
            string projectName = project.Name;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == invitePeopleDTO.ToEmail);
            if (user != null)
            {
                var existingMember = await _context.ProjectMembers
                    .FirstOrDefaultAsync(pm => pm.ProjectId == invitePeopleDTO.ProjectId && pm.UserId == user.Id);

                if (existingMember != null)
                    throw new ErrorException(400, "The account is already a member of the project.");
            }

            bool isSuccess = await _projectsServices.InviteMemberToProject(invitePeopleDTO, user.UserName, projectName);

            if (!isSuccess)
            {
                throw new ErrorException(500, $"Cannot send email to invite member!");
            }

            return Ok(new { message = "Invited member successfully!" });
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
    }
}