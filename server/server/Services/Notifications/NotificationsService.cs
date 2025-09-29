using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;

namespace server.Services.Project
{
    public class NotificationsService : INotifications
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public NotificationsService(ProjectManagementContext context, IMapper mapper)
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

        public async Task<List<Notification>> GetUserNotificationsLast7Days(string userId, int countDay)
        {
            var flagDay = DateTime.UtcNow.AddDays(-countDay);
            return await _context.Notifications
                .Where(n => n.UserId == userId && n.CreatedAt >= flagDay)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
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
    }
}
