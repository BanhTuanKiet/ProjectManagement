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
    public class TeamsController : ControllerBase
    {
        private readonly ITeams _teamServices;
        private readonly IProjects _projectServices;

        public TeamsController(ITeams teamServices, IProjects projectServices)
        {
            _teamServices = teamServices;
            _projectServices = projectServices;
        }

        [HttpPost("members/{projectId}/{learderId}")]
        // [Authorize("PMRequirement")]
        public async Task<ActionResult> AddMembers([FromBody] List<string> memberIds, int projectId, string learderId)
        {
            List<String> existingMemberIds = await _teamServices.AddMembers(learderId, memberIds);
            return Ok(existingMemberIds);
        }

        [HttpGet("members/{projectId}/{leaderId}")]
        // [Authorize(Roles = "LeaderRequirement")]
        public async Task<ActionResult> FindMembersTeam(int projectId, string leaderId)
        {
            List<ProjectDTO.ProjectMembers> projectMembers = await _projectServices.GetProjectMembers(projectId);
            List<string> teamMemberIds = await _teamServices.GetTeamMembers(leaderId);

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
    }
}