using AutoMapper;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.DTO;
using server.Models;

namespace server.Services.ProjectMemberService
{
    public class ProjectMemberServices : IProjectMember
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public ProjectMemberServices(ProjectManagementContext context, IMapper mapper, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<ProjectMember?> GetMemberAsync(int projectId, string userId)
        {
            return await _context.ProjectMembers
                .FirstOrDefaultAsync(x => x.ProjectId == projectId && x.UserId == userId);
        }
    }
}
