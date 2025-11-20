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
    public class TeamServices : ITeams
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public TeamServices(ProjectManagementContext context, IMapper mapper, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<Teams> CreateTeam(string leaderId)
        {
            var team = new Teams
            {
                Name = $"Team - {leaderId}",
                LeaderId = leaderId
            };

            await _context.Teams.AddAsync(team);
            await _context.SaveChangesAsync();
            return team;
        }

        public async Task<List<String>> AddMembers(string leaderId, List<string> memberIds)
        {
            var team = await _context.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.LeaderId == leaderId);

            if (team == null)
            {
                team = new Teams
                {
                    Name = $"Team - {leaderId}",
                    LeaderId = leaderId
                };

                await _context.Teams.AddAsync(team);
                await _context.SaveChangesAsync();
            }

            var existingMemberIds = team.Members.Select(m => m.UserId).ToList();

            foreach (var memberId in memberIds)
            {
                if (!existingMemberIds.Contains(memberId))
                {
                    team.Members.Add(new TeamMembers
                    {
                        TeamId = team.Id,
                        UserId = memberId
                    });
                }
            }

            await _context.SaveChangesAsync();
            return existingMemberIds;
        }

        public async Task<List<string>> GetTeamMembers(string leaderId)
        {
            var members = await _context.TeamMembers
                .Include(t => t.Team)
                .Where(t => t.Team.LeaderId == leaderId)
                .Select(t => t.UserId)
                .ToListAsync();

            return members;
        }

        public async Task<List<Teams>> GetAllTeamsInProject(int projectId)
        {
            return await _context.Teams
                .Include(t => t.Leader)
                .Include(t => t.Members).ThenInclude(m => m.User)
                .Where(t => t.Leader.ProjectMembers.Any(pm => pm.ProjectId == projectId && pm.RoleInProject == "Leader"))
                .ToListAsync();
        }
    }
}