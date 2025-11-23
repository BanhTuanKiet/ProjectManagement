using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using server.DTO;
using server.Models;
using server.Util;
using server.Configs;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography.X509Certificates;

namespace server.Services.Project
{
    public class TeamServices : ITeams
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;

        public TeamServices(ProjectManagementContext context, IMapper mapper, IConfiguration configuration, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
            _userManager = userManager;
        }

        public async Task<Teams> CreateTeam(string leaderId, int projectId)
        {
            var team = new Teams
            {
                Name = $"Team - {leaderId}",
                LeaderId = leaderId,
                ProjectId = projectId
            };

            await _context.Teams.AddAsync(team);
            await _context.SaveChangesAsync();
            return team;
        }

        public async Task<List<String>> AddMembers(string leaderId, List<string> memberIds, int projectId)
        {
            var team = await _context.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.LeaderId == leaderId && t.ProjectId == projectId);

            if (team == null)
            {
                team = new Teams
                {
                    Name = $"Team - {leaderId}",
                    LeaderId = leaderId,
                    ProjectId = projectId
                };

                await _context.Teams.AddAsync(team);
                await _context.SaveChangesAsync();
            }

            var existingMemberIds = team.Members
            .Where(m => m.TeamId == team.Id)
            .Select(m => m.UserId).ToList();

            foreach (var memberId in memberIds)
            {
                Console.WriteLine("Vào được foreach ");
                Console.WriteLine("AAAAAAAAAAA" + memberId);
                if (!existingMemberIds.Contains(memberId))
                {
                    Console.WriteLine("AAAAAAAAAAA" + memberId);
                    team.Members.Add(new TeamMembers
                    {
                        TeamId = team.Id,
                        UserId = memberId
                    });

                    var user = await _userManager.FindByIdAsync(memberId);

                    var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);

                    string projectUrl = $"http://localhost:3000/project/{projectId}";

                    string subject = $"[JIRA] You have been added to team ({team.Name})";

                    string body = $@"
                        <table width='100%' cellpadding='0' cellspacing='0' style='font-family:Arial,sans-serif;background-color:#f4f5f7;padding:30px 0;'>
                        <tr>
                            <td align='center'>
                            <table width='600' cellpadding='0' cellspacing='0' style='background-color:#ffffff;border-radius:8px;overflow:hidden;'>
                                
                                <!-- Header -->
                                <tr>
                                <td style='background-color:#0052CC;color:white;padding:20px 30px;font-size:20px;font-weight:bold;'>
                                    JIRA Project Notification
                                </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                <td style='padding:30px;color:#172B4D;font-size:16px;line-height:1.5;'>
                                    <p>Hi {user.UserName},</p>

                                    <p>You have been added to the team <strong>{team.Name}</strong> for the project <strong>{project.Name}</strong>.</p>

                                    <p>Please review the project details and confirm your access at your earliest convenience.</p>

                                    <hr style='margin:20px 0;border:none;border-top:1px solid #dfe1e6;' />

                                    <p><strong>Project Information</strong></p>
                                    <ul style='padding-left:20px;'>
                                    <li><strong>Project Name:</strong> {project.Name}</li>
                                    <li><strong>Team:</strong> {team.Name}</li>
                                    <li><strong>Added At:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</li>
                                    </ul>

                                    <hr style='margin:20px 0;border:none;border-top:1px solid #dfe1e6;' />

                                    <p>You can access the project dashboard using the button below:</p>

                                    <p style='text-align:center;'>
                                    <a href='{projectUrl}' 
                                        style='background-color:#0052CC;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;'>
                                        View Project
                                    </a>
                                    </p>

                                    <p>If you believe this was a mistake, please contact your project administrator.</p>

                                    <p>Best regards,<br>
                                    JIRA Team</p>
                                </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                <td style='background-color:#f4f5f7;color:#6b778c;font-size:12px;padding:15px 30px;text-align:center;'>
                                    © {DateTime.Now.Year} JIRA. All rights reserved.
                                </td>
                                </tr>

                            </table>
                            </td>
                        </tr>
                        </table>";

                    await EmailUtils.SendEmailAsync(_configuration, user.Email, subject, body);
                }
            }

            await _context.SaveChangesAsync();
            return existingMemberIds;
        }

        public async Task<List<string>> GetTeamMembers(string leaderId, int projectId)
        {
            var members = await _context.TeamMembers
                .AsNoTracking()
                .Include(t => t.Team)
                .Where(t => t.Team.LeaderId == leaderId && t.Team.ProjectId == projectId)
                .Select(t => t.UserId)
                .ToListAsync();

            return members;
        }

        public async Task<List<Teams>> GetAllTeamsInProject(int projectId)
        {
            return await _context.Teams
                .Include(t => t.Leader)
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .Where(t => t.Leader.ProjectMembers.Any(pm => pm.ProjectId == projectId && pm.RoleInProject == "Leader"))
                .ToListAsync();
        }

        public async Task<List<UserDTO.AvailableMember>> FindAvilableMembers(int projectId, string leaderId)
        {
            var memberIds = _context.ProjectMembers
                .Include(pm => pm.User)
                .Where(pm => pm.RoleInProject == "Member" && pm.ProjectId == projectId)
                .Select(pm => pm.UserId);

            var teamMemberIds = _context.TeamMembers
                .Include(tm => tm.Team)
                .Where(tm => tm.Team.ProjectId == projectId)
                .Select(tm => tm.UserId);

            var availableMemberIds = memberIds.Except(teamMemberIds);

            var availableMembers = await _context.Users
                .Where(u => availableMemberIds.Contains(u.Id))
                .ToListAsync();

            var availableMembersDTO = _mapper.Map<List<UserDTO.AvailableMember>>(availableMembers);

            return availableMembersDTO;
        }
        
        public async Task<Teams> GetTeamByLeader(string leaderId, int projectId)
        {
            return await _context.Teams
                .Include(t => t.Leader)
                .Include(t => t.Members).ThenInclude(m => m.User)
                .FirstOrDefaultAsync(t => t.LeaderId == leaderId && t.ProjectId == projectId);
        }

        public async Task<Teams> GetTeamById(Guid teamId)
        {
            var team = await _context.Teams
                .Include(t => t.Leader)
                .Include(t => t.Members).ThenInclude(m => m.User)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team == null)
                throw new ErrorException(400,$"Team with id '{teamId}' was not found.");

            return team;
        }
    }
}