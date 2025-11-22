using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;
using server.Util;
using server.Configs;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace server.Services.Project
{
    public class ProjectServices : IProjects
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public ProjectServices(ProjectManagementContext context, IMapper mapper, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<List<ProjectDTO.ProjectTitile>> GetProjectsTitle(string userId)
        {
            List<server.Models.Project> projects = await _context.Projects
                .Include(p => p.ProjectMembers)
                .Where(p => p.ProjectMembers.Any(pm => pm.UserId == userId))
                .ToListAsync();

            return _mapper.Map<List<ProjectDTO.ProjectTitile>>(projects);
        }

        public async Task<List<ProjectDTO.ProjectBasic>> GetProjects(string userId)
        {
            List<server.Models.Project> projects = await _context.Projects
                .Include(p => p.ProjectMembers)
                .ThenInclude(p => p.User)
                .Include(p => p.CreatedByNavigation)
                .Where(p => p.ProjectMembers.Any(pm => pm.UserId == userId))
                .ToListAsync();

            return _mapper.Map<List<ProjectDTO.ProjectBasic>>(projects);
        }

        public async Task<List<ProjectDTO.ProjectMembers>> GetProjectMembers(int projectId)
        {
            var projectMembers = await _context.ProjectMembers
                .Include(pm => pm.User)
                .Where(pm => pm.ProjectId == projectId)
                .ToListAsync();

            return _mapper.Map<List<ProjectDTO.ProjectMembers>>(projectMembers);
        }

        public async Task<List<ProjectDTO.ProjectMembers>> GetProjectMembersByRole(int projectId, string role, string UserId)
        {
            // 1. Khởi tạo Query cơ bản (Chưa chạy xuống DB)
            var query = _context.ProjectMembers
                .Include(pm => pm.User)
                .Include(pm => pm.Project)
                .Where(pm => pm.ProjectId == projectId)
                .AsQueryable(); // Chuyển sang IQueryable để có thể nối thêm điều kiện

            // 2. Xử lý logic theo Role
            switch (role)
            {
                case "Project Manager":
                    // PM lấy tất cả -> Không cần filter thêm gì cả
                    break;

                case "Member":
                    // Member chỉ lấy chính bản thân mình
                    query = query.Where(pm => pm.UserId == UserId);
                    break;

                case "Leader":
                    var teamIds = _context.Teams
                        .Where(t => t.ProjectId == projectId && t.LeaderId == UserId)
                        .Select(t => t.Id);

                    // B2: Tìm danh sách UserId thuộc các team đó
                    var teamMemberUserIds = _context.TeamMembers
                        .Where(tm => teamIds.Contains(tm.TeamId))
                        .Select(tm => tm.UserId);

                    // B3: Filter ProjectMembers: Phải là (Bản thân Leader) HOẶC (Nằm trong list thành viên team)
                    query = query.Where(pm => pm.UserId == UserId || teamMemberUserIds.Contains(pm.UserId));
                    break;

                default:
                    // Trường hợp role lạ hoặc không xác định -> Trả về rỗng hoặc chỉ trả về bản thân (tùy bạn chọn)
                    // Ở đây mình để default là chỉ trả về bản thân cho an toàn
                    query = query.Where(pm => pm.UserId == UserId);
                    break;
            }

            // 3. Thực thi Query và Map dữ liệu
            var projectMembers = await query.ToListAsync();

            return _mapper.Map<List<ProjectDTO.ProjectMembers>>(projectMembers);
        }

        public async Task<server.Models.Project> FindProjectById(int projectId)
        {
            return await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
        }

        public async Task<Models.Project> GetProjectBasic(int projectId)
        {
            var project = await _context.Projects
                .Where(p => p.ProjectId == projectId)
                .Select(p => new Models.Project
                {
                    ProjectId = p.ProjectId,
                    Name = p.Name,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate
                })
                .FirstOrDefaultAsync();

            return project;
        }

        public async Task<string> GetProjectRole(string userId, int projectId)
        {
            var projectMember = await _context.ProjectMembers.FirstOrDefaultAsync(p => p.UserId == userId && p.ProjectId == projectId);
            return projectMember.RoleInProject;
        }

        public async Task<bool> ChangeStatusIsStarred(int projectId, bool isStarred)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);

            if (project == null)
            {
                throw new Exception("Project not found");
            }

            project.IsStarred = isStarred;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> GetStatusIsStarred(int projectId)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);

            if (project == null)
            {
                throw new Exception("Project not found");
            }

            return project.IsStarred;
        }

        public async Task<bool> InviteMemberToProject(int projectId, string email, string RoleInProject, string inviterName, string projectName)
        {
            var token = Guid.NewGuid();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            var existingInvitation = await _context.ProjectInvitations
                .Where(i => i.Email == email && i.ProjectId == projectId && i.IsAccepted == false)
                .ToListAsync();

            if (existingInvitation.Any())
            {
                _context.ProjectInvitations.RemoveRange(existingInvitation);
                await _context.SaveChangesAsync();
            }
            var invitation = new ProjectInvitations
            {
                ProjectId = projectId,
                Email = email,
                RoleInProject = RoleInProject,
                Token = token,
                IsAccepted = false,
                InvitedAt = DateTime.UtcNow
            };
            await _context.ProjectInvitations.AddAsync(invitation);
            await _context.SaveChangesAsync();

            string subject = $"[JIRA] You've been invited to join project \"{projectName}\"";

            string body = $@"
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background-color:#f4f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;"">
            <tr>
                <td align=""center"" style=""padding:40px 20px;"">
                <table width=""600"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);"">
                    
                    <!-- Header -->
                    <tr>
                    <td style=""background:#0052CC; padding:24px 32px; text-align:center;"">
                        <h1 style=""color:#ffffff; margin:0; font-size:24px; font-weight:600; letter-spacing:-0.5px;"">
                        Project Invitation
                        </h1>
                    </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                    <td style=""padding:40px 32px; color:#172b4d; font-size:16px; line-height:1.6;"">
                        <p style=""margin:0 0 20px; font-size:18px;"">
                        Hello {user.UserName},
                        </p>

                        <p style=""margin:0 0 24px;"">
                        <strong>{inviterName}</strong> has invited you to collaborate on the project
                        <strong style=""color:#0052cc;"">{projectName}</strong> in JIRA.
                        </p>

                        <p style=""margin:0 0 32px;"">
                        Click the button below to accept the invitation and access the project:
                        </p>

                        <div style=""text-align:center;"">
                        <a href=""http://localhost:3000/login?email={Uri.EscapeDataString(invitation.Email)}""
                            style=""background:#0052cc; color:#ffffff; font-weight:600; font-size:16px; padding:14px 32px; border-radius:6px; text-decoration:none; display:inline-block; box-shadow:0 4px 8px rgba(0,82,204,0.25);"">
                            Accept Invitation
                        </a>
                        </div>

                        <hr style=""border:none; border-top:1px solid #dfe1e6; margin:40px 0;"" />

                        <p style=""margin:0; font-size:14px; color:#505f79;"">
                        If you don't have a JIRA account yet, one will be created automatically when you accept this invitation.
                        </p>

                        <p style=""margin:20px 0 0; font-size:14px; color:#505f79;"">
                        This invitation will expire in 7 days.
                        </p>
                    </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                    <td style=""background:#f4f5f7; padding:20px 32px; text-align:center; color:#6b778c; font-size:12px;"">
                        © {DateTime.Now:yyyy} JIRA • This is an automated message, please do not reply directly to this email.
                    </td>
                    </tr>

                </table>
                </td>
            </tr>
            </table>";

            await EmailUtils.SendEmailAsync(_configuration, email, subject, body);
            return true;
        }

        public async Task<Models.Project> UpdateProject(int projectId, ProjectDTO.UpdateProject updatedData)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(t => t.ProjectId == projectId);
            if (project == null)
                return null;

            project.Name = updatedData.Title ?? project.Name;
            project.Description = updatedData.Description ?? project.Description;
            project.StartDate = updatedData.StartDate ?? project.StartDate;
            project.EndDate = updatedData.EndDate ?? project.EndDate;

            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<int> CountProject(string ownerId)
        {
            return await _context.Projects.CountAsync(p => p.CreatedBy == ownerId);
        }

        public async Task<Models.Project> CreateProject(ProjectDTO.CreateProject projectDTO)
        {
            var project = new Models.Project
            {
                Name = projectDTO.Name,
                Description = projectDTO.Description,
                StartDate = projectDTO.StartDate,
                EndDate = projectDTO.EndDate,
                CreatedBy = projectDTO.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                IsStarred = true
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var projectId = _context.Projects.Where(p => p.Name == projectDTO.Name && p.CreatedBy == projectDTO.CreatedBy)
                .Select(p => p.ProjectId)
                .FirstOrDefault();

            var ownerMember = new ProjectMember
            {
                ProjectId = project.ProjectId,
                UserId = projectDTO.CreatedBy,
                RoleInProject = "Project Manager",
                JoinedAt = DateTime.UtcNow
            };

            _context.ProjectMembers.Add(ownerMember);
            await _context.SaveChangesAsync();

            return project;
        }

        public async Task<bool> DeleteProject(int projectId)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null) return false;

            var projectMembers = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == projectId)
                .ToListAsync();

            var teams = await _context.Teams.Where(t => t.ProjectId == projectId).ToListAsync();

            var teamIds = teams.Select(t => t.Id).ToList();

            var members = await _context.TeamMembers
                .Where(m => teamIds.Contains(m.TeamId))
                .ToListAsync();


            _context.TeamMembers.RemoveRange(members);

            _context.Teams.RemoveRange(teams);

            _context.ProjectMembers.RemoveRange(projectMembers);

            _context.Projects.Remove(project);


            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeLeader(int projectId, string leaderId, string newLeaderId)
        {
            ProjectMember leader = await _context.ProjectMembers.FirstOrDefaultAsync(pm => pm.UserId == leaderId && pm.ProjectId == projectId);
            ProjectMember newLeader = await _context.ProjectMembers.FirstOrDefaultAsync(pm => pm.UserId == newLeaderId && pm.ProjectId == projectId);

            leader.RoleInProject = "Member";
            newLeader.RoleInProject = "Leader";

            await _context.SaveChangesAsync();
            return true;
        }
    }
}

