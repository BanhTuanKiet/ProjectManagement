using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using server.Services.User;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using server.Configs;
using server.Util;

namespace server.Controllers
{
    [Route("notifications")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly INotifications _notificationService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        public NotificationsController(INotifications notificationService, UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _notificationService = notificationService;
            _userManager = userManager;
            _configuration = configuration;
        }

        [Authorize()]
        [HttpGet()]
        public async Task<ActionResult> GetNotifications()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<Notification> notifications = await _notificationService.GetNotificationsByUserId(userId);
            return Ok(notifications);
        }

        [Authorize]
        [HttpPut("read/{notifiId}")]
        public async Task<ActionResult> MarkReadNotfify(int notifiId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Notification notification = await _notificationService.GetNotificationById(notifiId);

            if (notification == null)
            {
                throw new ErrorException(404, "Notification not found");
            }

            if (notification.UserId != userId)
            {
                throw new ErrorException(403, "This notification does not belong to you");
            }

            int countUpdated = await _notificationService.MarkRead(notification.NotificationId);
            if (countUpdated == 0) return null;
            return Ok();
        }
    }
}