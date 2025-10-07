using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;
using server.Util;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace server.Services.Project
{
  public class ProjectsService : IProjects
  {
    public readonly ProjectManagementContext _context;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;

    public ProjectsService(ProjectManagementContext context, IMapper mapper, IConfiguration configuration)
    {
      _context = context;
      _mapper = mapper;
      _configuration = configuration;
    }


        public async Task<List<ProjectDTO.ProjectTitile>> GetProjectsTitle(string userId)
        {
            List<server.Models.Project> projects = await _context.Projects
                .Include(p => p.CreatedByNavigation)
                .Where(p => p.CreatedBy == userId)
                .ToListAsync();

            return _mapper.Map<List<ProjectDTO.ProjectTitile>>(projects);
        }

        public async Task<List<ProjectDTO.ProjectMembers>> GetProjectMembers(int projectId)
        {
            var projectMembers = await _context.ProjectMembers
                .Include(pm => pm.User)
                .Where(pm => pm.ProjectId == projectId)
                .ToListAsync();
            foreach (var pm in projectMembers)
            {
                Console.WriteLine($"UserId={pm.UserId}, Role={pm.RoleInProject}, JoinedAt={pm.JoinedAt}");
            }
            return _mapper.Map<List<ProjectDTO.ProjectMembers>>(projectMembers);
        }

        public async Task<server.Models.Project> FindProjectById(int projectId)
        {
            return await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
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


        public async Task<bool> InviteMemberToProject(InvitePeopleForm invitePeopleDTO, string inviterName, string projectName) {
            var token = Guid.NewGuid();
            Console.WriteLine("Invitation record created with token: " + token);
             var invitation = new ProjectInvitations
                {
                    ProjectId = invitePeopleDTO.ProjectId,
                    Email = invitePeopleDTO.ToEmail,
                    RoleInProject = invitePeopleDTO.RoleInProject,
                    Token = token,
                    IsAccepted = false,
                    InvitedAt = DateTime.UtcNow
                };
                await _context.ProjectInvitations.AddAsync(invitation);
                Console.WriteLine("Invitation record added to context.");
                await _context.SaveChangesAsync();
                

        string subject = $"[JIRA]({inviterName}) invited you to ({projectName})";

            string body = $@"
            <div style='font-family:Arial,sans-serif; text-align:center;'>
                <img src='https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png' width='40' style='margin-bottom:20px;'/>
                <h2>{inviterName} invited you to <b>{projectName}</b></h2>
                <a href='http://localhost:3000/login?token={token}'  
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

            Console.WriteLine("Sending email to: " + invitePeopleDTO.ToEmail);

            await EmailUtils.SendEmailAsync(_configuration, invitePeopleDTO.ToEmail, subject, body);
            Console.WriteLine("Email sent successfully!");

            return true;
        }
    }
}

