using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;

namespace server.Services.Project
{
    public class NotificationServices : INotifications
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public NotificationServices(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Notification> SaveNotification(Notification notification)
        {
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            return notification;
        }

        public async Task<List<Notification>> GetNotificationsByUserId(string userId)
        {
            return await _context.Notifications.Where(n => n.UserId == userId).ToListAsync();
        }

        public async Task<List<NotificationDTO.NotificationBasic>> GetUserNotificationsLast7Days(string userId, int countDay)
        {
            var flagDay = DateTime.UtcNow.AddDays(-countDay);
            var notifications = await _context.Notifications
                .Include(n => n.User)
                .Include(n => n.CreatedBy)
                .Where(n => n.UserId == userId && n.CreatedAt >= flagDay)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<NotificationDTO.NotificationBasic>>(notifications);
        }

        public async Task<List<NotificationDTO.NotificationBasic>> GetNotificationByType(string userId, string type)
        {
            var projectRoles = await _context.ProjectMembers
                .Where(pm => pm.UserId == userId)
                .Select(pm => new { pm.ProjectId, pm.RoleInProject })
                .ToListAsync();

            var allNotifications = new List<Models.Notification>();

            foreach (var pr in projectRoles)
            {
                int projectId = pr.ProjectId;
                string role = pr.RoleInProject ?? "";

                IQueryable<Models.Notification> query = _context.Notifications
                    .Include(n => n.User)
                    .Include(n => n.CreatedBy)
                    .Where(n => n.ProjectId == projectId && n.Type == type);

                if (string.Equals(role, "member", StringComparison.OrdinalIgnoreCase) && type == "project")
                {
                    query = query.Where(n => n.UserId == userId || n.Type == type);
                }
                else if (string.Equals(role, "member", StringComparison.OrdinalIgnoreCase) && type == "task")
                {
                    query = query.Where(n => n.UserId == userId);
                }

                var notifications = await query
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                allNotifications.AddRange(notifications);
            }

            var orderedAll = allNotifications
                .OrderByDescending(n => n.CreatedAt)
                .ToList();

            return _mapper.Map<List<NotificationDTO.NotificationBasic>>(orderedAll);
        }

        public async Task<Notification> GetNotificationById(long notificationId)
        {
            return await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == notificationId);
        }

        public async Task<int> MarkRead(long notifyId)
        {
            return await _context.Notifications
                .Where(n => n.NotificationId == notifyId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(n => n.IsRead, true)
                );
        }

        public async Task<int> DeleteNotify(long notifyId)
        {
            return await _context.Notifications
                .Where(n => n.NotificationId == notifyId)
                .ExecuteDeleteAsync();
        }

        public async Task<List<NotificationDTO.NotificationBasic>> GetNotificationByUserIdAndRole(string userId)
        {
            var projectRoles = await _context.ProjectMembers
                .Where(pm => pm.UserId == userId)
                .ToListAsync();

            var projectIdRole = projectRoles.ToDictionary(x => x.ProjectId, x => x.RoleInProject);
            var projectIds = projectIdRole.Keys.ToList();

            var notif = await _context.Notifications
                .Include(n => n.User)
                .Include(n => n.CreatedBy)
                .Where(n => n.ProjectId.HasValue && projectIds.Contains(n.ProjectId.Value))
                .ToListAsync();

            var allNotifications = new List<Models.Notification>();

            foreach (var kvp in projectIdRole)
            {
                int projectId = kvp.Key;
                string role = kvp.Value ?? "";

                var perProject = notif.Where(n => n.ProjectId == projectId);

                if (string.Equals(role, "member", StringComparison.OrdinalIgnoreCase))
                {
                    perProject = perProject.Where(n =>
                        n.UserId == userId || n.Type == "project");
                }
                // else
                // {
                //     perProject = perProject.Where(n =>
                //         n.UserId == userId || n.UserId == null);
                // }

                allNotifications.AddRange(perProject);
            }

            var ordered = allNotifications
                .OrderByDescending(n => n.CreatedAt)
                .ToList();

            return _mapper.Map<List<NotificationDTO.NotificationBasic>>(ordered);
        }
    }
}
