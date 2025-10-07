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

        [Authorize()]
        [HttpGet()]
        public async Task<ActionResult> GetProjectsTitle()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<ProjectDTO.ProjectTitile> projects =
              await _projectsServices.GetProjectsTitle("user1") ?? throw new ErrorException(500, "Project not found");

            return Ok(projects);
        }

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
            Project project = await _projectsServices.FindProjectById(invitePeopleDTO.ProjectId) ?? throw new ErrorException(500, "Project not found");
            string projectName = project.Name;
            Console.WriteLine("Invitation email sent successfully.");
            try
            {
                await _projectsServices.InviteMemberToProject(invitePeopleDTO, "trandat2280600642@gmail.com", projectName);
                Console.WriteLine("Invitation email sent successfully 2.");
            }
            catch (Exception ex)
            {
                throw new ErrorHandlingException(500, $"Không thể gửi email: {ex.Message}");
            }
            return Ok(new { message = "Invited member successfully!" });
        }

        [HttpPost("acceptInvitation")]
        [Authorize] // bắt buộc đã đăng nhập Google
        public async Task<IActionResult> AcceptInvitation([FromQuery] Guid token)
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Không tìm thấy email từ tài khoản Google.");

            var invitation = await _context.ProjectInvitations
                .FirstOrDefaultAsync(i => i.Token == token && i.IsAccepted == false);

            if (invitation == null)
                return BadRequest("Lời mời không tồn tại hoặc đã được chấp nhận.");

            // Kiểm tra email trùng khớp
            if (!invitation.Email.Equals(userEmail, StringComparison.OrdinalIgnoreCase))
                return Forbid("Lời mời này không được gửi đến email của bạn.");

            // Tìm hoặc tạo user (nếu user mới lần đầu login)
            var user = await _userManager.FindByEmailAsync(userEmail);
            if (user == null)
            {
                string username = userEmail.Split('@')[0];
                user = new ApplicationUser
                {
                    Email = userEmail,
                    UserName = username,
                    EmailConfirmed = true
                };
                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded)
                    return BadRequest("Không thể tạo tài khoản mới.");

                await _userManager.AddToRoleAsync(user, "User");
            }

            // Kiểm tra nếu user đã trong project
            var existed = await _context.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == invitation.ProjectId && pm.UserId == user.Id);
            if (!existed)
            {
                var member = new ProjectMember
                {
                    ProjectId = invitation.ProjectId,
                    UserId = user.Id,
                    RoleInProject = invitation.RoleInProject,
                    JoinedAt = DateTime.UtcNow
                };
                _context.ProjectMembers.Add(member);
            }

            // Cập nhật trạng thái invitation
            invitation.IsAccepted = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã tham gia dự án thành công!" });
        }

    }
}