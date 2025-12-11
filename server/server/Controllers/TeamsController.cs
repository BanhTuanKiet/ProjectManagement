using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.DTO;
using server.Models;
using server.Services.ActivityLog;
using server.Services.Project;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class TeamsController : ControllerBase
    {
        private readonly ITeams _teamServices;
        private readonly ProjectManagementContext _context;
        private readonly IProjects _projectServices;
        private readonly IMapper _mapper;
        public TeamsController(ITeams teamServices, IProjects projectServices, IMapper mapper, ProjectManagementContext context)
        {
            _teamServices = teamServices;
            _projectServices = projectServices;
            _mapper = mapper;
            _context = context;
        }

        [HttpPost("members/{projectId}/{leaderId}")]
        public async Task<ActionResult> AddMembers([FromBody] List<string> memberIds, int projectId, string leaderId)
        {
            if (memberIds == null || memberIds.Count == 0)
                throw new ErrorException(400, "No members provided");

            var teamMembers = await _teamServices.FindMembers(leaderId)
                ?? throw new ErrorException(404, "Team not found");

            var existingMembers = teamMembers
                .Where(m => memberIds.Contains(m.UserId))
                .Select(m => new
                {
                    Id = m.UserId,
                    Name = m.User.UserName
                })
                .ToList();

            var idsToAdd = memberIds
                .Where(id => !existingMembers.Any(m => m.Id == id))
                .ToList();

            var failedMembers = existingMembers;

            if (idsToAdd.Count <= 0)
            {

                return Ok(new
                {
                    failedMembers,
                });
            }

            var addedMembers = await _teamServices.AddMembers(leaderId, idsToAdd, projectId);

            return Ok(new
            {
                failedMembers,
                addedMembers
            });
        }

        [HttpGet("members/{projectId}/{leaderId}")]
        // [Authorize(Roles = "LeaderRequirement")]
        public async Task<ActionResult> FindMembersTeam(int projectId, string leaderId)
        {
            List<ProjectDTO.ProjectMembers> projectMembers = await _projectServices.GetProjectMembers(projectId);
            List<string> teamMemberIds = await _teamServices.GetTeamMembers(leaderId, projectId);

            List<ProjectDTO.ProjectMembers> teamMembers = projectMembers
                .Where(pm => teamMemberIds.Contains(pm.userId))
                .ToList();

            return Ok(teamMembers);
        }

        [HttpGet("members/available/{projectId}/{leaderId}")]
        public async Task<ActionResult> FindAvailableMembers(int projectId, string leaderId)
        {
            List<UserDTO.AvailableMember> availableMembers = await _teamServices.FindAvilableMembers(projectId, leaderId);
            return Ok(availableMembers);
        }

        [HttpGet("all-members")]
        public async Task<ActionResult> FindAllMembers()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<TeamDTO.TeamMembers> allMembers = await _teamServices.GetMemberByUserId(userId);
            return Ok(allMembers);
        }

        [Authorize(Roles = "PMRequirement")]
        [HttpPut("change-team/{projectId}")]
        public async Task<ActionResult> ChangeTeam(int projectId, [FromBody] TeamDTO.ChangeTeamRequest request)
        {
            var result = await _teamServices.ChangeTeamForUser(request.UserId, request.NewLeaderId, projectId);
            if (!result)
            {
                throw new ErrorException(400, "Failed to change team for user.");
            }
            List<ProjectDTO.ProjectMembers> projectMembers = await _projectServices.GetProjectMembers(projectId);
            return Ok(new
            {
                data = projectMembers,
                message = "Team changed successfully."
            });
        }

        [Authorize(Roles = "PMRequirement")]
        [HttpDelete("remove-member/{projectId}/{userId}")]
        public async Task<ActionResult> RemoveMember(int projectId, string userId)
        {
            var result = await _teamServices.RemoveMemberFromTeam(userId, projectId);
            if (!result)
            {
                throw new ErrorException(400, "Failed to remove member from team.");
            }
            List<ProjectDTO.ProjectMembers> projectMembers = await _projectServices.GetProjectMembers(projectId);
            return Ok(new
            {
                data = projectMembers,
                message = "Member removed successfully."
            });
        }
    }
}