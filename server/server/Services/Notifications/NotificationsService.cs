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
    }
}
