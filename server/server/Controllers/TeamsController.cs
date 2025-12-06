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
        private readonly IMapper _mapper;
        public TeamsController(ITeams teamServices, IProjects projectServices, IMapper mapper)
        {
            _teamServices = teamServices;
            _projectServices = projectServices;
            _mapper = mapper;
        }

        [HttpPost("members/{projectId}/{learderId}")]
        // [Authorize("PMRequirement")]
        public async Task<ActionResult> AddMembers([FromBody] List<string> memberIds, int projectId, string learderId)
        {
            List<String> existingMemberIds = await _teamServices.AddMembers(learderId, memberIds, projectId);
            return Ok(new
            {
                message = "Add team successfully!",
                existingMemberIds
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
    }
}