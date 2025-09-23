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

    }
}