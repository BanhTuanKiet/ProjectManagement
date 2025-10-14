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
using server.DTO;
using AutoMapper;

namespace server.Controllers
{
    [Route("notifications")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class NotificationsController : ControllerBase
    {
        private readonly INotifications _notificationService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        public NotificationsController(INotifications notificationService, UserManager<ApplicationUser> userManager, IConfiguration configuration, IMapper mapper)
        {
            _notificationService = notificationService;
            _userManager = userManager;
            _configuration = configuration;
            _mapper = mapper;
        }

        [HttpGet("{type}")]
        public async Task<ActionResult> GetNotifications(string type)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<NotificationDTO.NotificationBasic> notifications = await _notificationService.GetNotificationByType(userId, type);
            return Ok(notifications);
        }

        [HttpPut("read/{notifiId}")]
        public async Task<ActionResult> MarkReadNotfify(int notifiId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Notification notification = await _notificationService.GetNotificationById(notifiId);

            if (notification == null) throw new ErrorException(404, "Notification not found");

            if (notification.UserId != userId) throw new ErrorException(403, "This notification does not belong to you");

            if (notification.IsRead) return Ok(notification.Link);

            await _notificationService.MarkRead(notification.NotificationId);

            return Ok(notification.Link);
        }

        [HttpDelete("{notifiId}")]
        public async Task<ActionResult> DeleteNotify(int notifiId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Notification notification = await _notificationService.GetNotificationById(notifiId);

            if (notification == null) throw new ErrorException(404, "Notification not found");

            if (notification.UserId != userId) throw new ErrorException(403, "This notification does not belong to you");

            int isDeleted = await _notificationService.DeleteNotify(notifiId);

            if (isDeleted <= 0) throw new ErrorException(400, "Delete failed");

            return NoContent();
        }
    }
}