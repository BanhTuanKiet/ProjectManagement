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

            string subject = $"[JIRA]({inviterName}) invited you to ({projectName})";

            string body = $@"
                <div style='font-family:Arial,sans-serif; text-align:center;'>
                    <img src='https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png' width='40' style='margin-bottom:20px;'/>
                    <h2>{inviterName} invited you to <b>{projectName}</b></h2>
                    <a href='http://localhost:3000/login?email={invitation.Email}'  
                    style='background:#0052CC; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block; margin:20px 0;'>
                        Join the Project
                    </a>
                    <hr style='margin:30px 0;'/>
                    <h3>Use your app to...</h3>
                    <div style='display:flex; justify-content:center; gap:20px;'>
                        <div style='max-width:200px;'>
                            <img src='https://cdn-icons-png.flaticon.com/512/1828/1828961.png' width='50'/>
                            <p>Collaborate, align, and deliver work, all in <b>one place</b></p>
                        </div>
                        <div style='max-width:200px;'>
                            <img src='https://cdn-icons-png.flaticon.com/512/1828/1828859.png' width='50'/>
                            <p>View work your way using the list, board, calendar and timeline views</p>
                        </div>
                        <div style='max-width:200px;'>
                            <img src='https://cdn-icons-png.flaticon.com/512/1828/1828940.png' width='50'/>
                            <p>Collect and send work to other teams using <b>forms</b></p>
                        </div>
                    </div>
                </div>";

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

