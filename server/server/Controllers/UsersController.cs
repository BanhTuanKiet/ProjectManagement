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
    [Route("users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUsers _userServices;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        public UsersController(IUsers userServices, UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _userServices = userServices;
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpGet("signin-google")]
        public IActionResult SignGoogle(string returnUrl = "http://localhost:3000/project")
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action("GoogleCallback", "Auth", new { returnUrl })
            };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("token")]
        public ActionResult GetToken()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Ok(userId ?? null);
        }
        
        [HttpGet("signout")]
        public IActionResult Logout()
        {
            return SignOut(new AuthenticationProperties { RedirectUri = "/" },
                GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("")]
        public async Task<ActionResult> GetUsers()
        {
            List<ApplicationUser> users = await _userServices.GetUsers();
            return Ok(users);
        }
    }
}