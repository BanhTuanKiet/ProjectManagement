using AutoMapper;
using server.Models;
using Microsoft.EntityFrameworkCore;
using server.DTO;

namespace server.Services.ActivityLog
{
    public class ActivityLogServices : IActivityLog
    {
        private readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public ActivityLogServices(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Models.ActivityLog?> AddActivityLog(int projectId, string userId, string action, string targetType, string targetId, string description)
        {
            var ActivityLog = new Models.ActivityLog
            {
                ProjectId = projectId,
                UserId = userId,
                Action = action,
                TargetType = targetType,
                TargetId = targetId,
                Description = description,
                CreatedAt = DateTime.Now
            };

            _context.ActivityLogs.Add(ActivityLog);
            await _context.SaveChangesAsync();
            return ActivityLog;
        }

        public async Task<List<Models.ActivityLog>> GetLogsByProjectAsync(int projectId)
        {
            return await _context.ActivityLogs
                .Where(x => x.ProjectId == projectId)
                .OrderByDescending(x => x.CreatedAt)
                .Include(x => x.User)
                .ToListAsync();
        }
    }
}