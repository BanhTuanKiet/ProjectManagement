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
using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using NuGet.Versioning;

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
        private readonly ITeams _teamServices;
        private readonly INotifications _notificationsService;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _notificationHubContext;

        public ProjectsController(
            IProjects projectsServices,
            UserManager<ApplicationUser> userManager,
            ProjectManagementContext context,
            IActivityLog activityLog,
            INotifications notificationsService,
            IMapper mapper,
            ITeams teams,
            IHubContext<NotificationHub> notificationHubContext)
        {
            _projectsServices = projectsServices;
            _userManager = userManager;
            _context = context;
            _activityLogServices = activityLog;
            _notificationsService = notificationsService;
            _mapper = mapper;
            _teamServices = teams;
            _notificationHubContext = notificationHubContext;
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

        [HttpGet("{projectId}/member/by-role/{role}")]
        public async Task<ActionResult> GetProjectMembersByRole(int projectId, string role)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<ProjectDTO.ProjectMembers> projectMembers = await _projectsServices.GetProjectMembersByRole(projectId, role, userId);
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
            var inviterName = User.FindFirst(ClaimTypes.Name)?.Value;
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
                    inviterName,
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
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            if (project == null)
                return NotFound("Project not found");

            if (updatedData.StartDate.HasValue && updatedData.EndDate.HasValue &&
                updatedData.StartDate.Value > updatedData.EndDate.Value)
            {
                return BadRequest("Start date cannot be greater than End date");
            }

            bool hasChanges = false;
            string changeSummary = "";

            if (!string.IsNullOrWhiteSpace(updatedData.Title) && updatedData.Title != project.Name)
            {
                string oldTitle = project.Name;
                project.Name = updatedData.Title.Trim();
                changeSummary += $"Title changed from '{oldTitle}' to '{updatedData.Title}'; ";
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(updatedData.Description) && updatedData.Description != project.Description)
            {
                project.Description = updatedData.Description.Trim();
                changeSummary += $"Description changed; ";
                hasChanges = true;
            }

            if (updatedData.StartDate.HasValue && updatedData.StartDate.Value != project.StartDate)
            {
                DateOnly? oldStartDatet = project.StartDate;
                project.StartDate = updatedData.StartDate.Value;
                changeSummary += $"Start Date changed from '{oldStartDatet?.ToString()}' to '{project.StartDate?.ToString()}'; ";

                hasChanges = true;
            }

            if (updatedData.EndDate.HasValue && updatedData.EndDate.Value != project.EndDate)
            {
                DateOnly? oldEndDate = project.EndDate;
                project.EndDate = updatedData.EndDate.Value;
                changeSummary += $"End Date changed from '{oldEndDate?.ToString()}' to '{project.EndDate?.ToString()}'; ";
                hasChanges = true;
            }

            if (!hasChanges)
                throw new ErrorException(400, "No changes were made");

            Models.Project updatedProject = await _projectsServices.UpdateProject(projectId, updatedData);

            if (updatedProject == null)
                throw new ErrorException(400, "Update Project Fail!");

            var parts = changeSummary.Split(";", StringSplitOptions.RemoveEmptyEntries);
            var notifications = new List<Notification>();

            foreach (var p in parts)
            {
                var message = p.Trim();

                if (!string.IsNullOrWhiteSpace(message))
                {
                    var notification = new Notification
                    {
                        UserId = null,
                        ProjectId = projectId,
                        Message = message,
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        Link = "",
                        CreatedId = userId,
                        Type = "project"
                    };
                    await _notificationsService.SaveNotification(notification);
                    var notificationDto = _mapper.Map<NotificationDTO.NotificationBasic>(notification);
                    await NotificationHub.SendNotificationToAllExcept(_notificationHubContext, projectId, userId, notificationDto);
                }
            }

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

        [HttpDelete("{projectId}")]
        public async Task<IActionResult> DeleteProject(int projectId)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            bool status = await _projectsServices.DeleteProject(projectId);
            if (!status)
                throw new ErrorException("Delete project fail!");

            var notification = new Notification
            {
                UserId = null,
                ProjectId = projectId,
                Message = $"{project.Name} was deleted by {name}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = "",
                CreatedId = userId,
                Type = "project"
            };
            await _notificationsService.SaveNotification(notification);
            var notificationDto = _mapper.Map<NotificationDTO.NotificationBasic>(notification);
            await NotificationHub.SendNotificationProject(_notificationHubContext, projectId, userId, notificationDto);
            return Ok(new { message = "Delete project successfull!" });
        }

        [HttpPut("leader/{projectId}/{leaderId}/{newLeaderId}")]
        [Authorize(Policy = "PMRequirement")]
        public async Task<ActionResult> ChangeLeader(int projectId, string leaderId, string newLeaderId)
        {
            Teams team = await _teamServices.DemoGetTeamByLeader(projectId, leaderId)
                ?? throw new ErrorException(404, "Team not found or leader not in project");

            var oldLeaderTM = team ?? throw new ErrorException(404, "Leader not found in team");

            var newLeaderTM = team.Members.FirstOrDefault(m => m.UserId == newLeaderId)
                ?? throw new ErrorException(404, "New leader not found in team");

            var oldLeaderPM = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.UserId == leaderId && pm.ProjectId == projectId);

            var newLeaderPM = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.UserId == newLeaderId && pm.ProjectId == projectId);

            team.LeaderId = newLeaderId;
            newLeaderTM.UserId = leaderId;

            var tmp = oldLeaderTM.JoinedAt;
            oldLeaderTM.JoinedAt = newLeaderTM.JoinedAt;
            newLeaderTM.JoinedAt = tmp;

            oldLeaderPM.RoleInProject = "Member";
            newLeaderPM.RoleInProject = "Leader";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Change leader successful" });
        }

        [Authorize(Policy = "MemberRequirement")]
        [HttpGet("member/{projectId}")]
        public async Task<ActionResult> GetProjectMembers(int projectId)
        {
            Project project = await _projectsServices.FindProjectById(projectId) ?? throw new ErrorException(500, "Project not found");
            List<ProjectDTO.ProjectMembers> projectMembers = await _projectsServices.GetProjectMembers(projectId);
            return Ok(projectMembers);
        }
    }
}