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
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;

namespace server.Controllers
{
    [Route("users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUsers _userServices;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IHubContext<PresenceHubConfig> _hubContext;
        public readonly ProjectManagementContext _context;
        
        public UsersController(
            IUsers userServices,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            IHubContext<PresenceHubConfig> hubContext,
            ProjectManagementContext context)
        {
            _userServices = userServices;
            _userManager = userManager;
            _configuration = configuration;
            _hubContext = hubContext;
            _context = context;
        }

        [HttpGet("signin-google")]
        public IActionResult SignGoogle(string? token = null, string returnUrl = "http://localhost:3000/project")
        {
            if (string.IsNullOrEmpty(returnUrl))
            {
                var configReturnUrl = _configuration["Authentication:Google:ReturnUrl"];
                returnUrl = configReturnUrl ?? "/";
            }   

            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action("GoogleCallback", "Auth", new { returnUrl }),
                Items = { { "invite_token", token ?? "" } }
            };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("infor")]
        public ActionResult GetToken()
        {
            var token = Request.Cookies["token"];
            if (token == null) return Ok();
            TokenDTO.DecodedToken decodedToken = JwtUtils.DecodeToken(token);
            return Ok(decodedToken);
        }

        [HttpGet("signout")]
        public async Task<ActionResult> Signout()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            CookieUtils.RemoveCookie(Response, "token");
            await PresenceHubConfig.Signout(_hubContext, userId);
            return Ok(new { message = "Logout successful" });
        }

        [HttpGet("")]
        public async Task<ActionResult> GetUsers()
        {
            List<ApplicationUser> users = await _userServices.GetUsers();
            return Ok(users);
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginForm request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            //if (!isPasswordValid)
            //    throw new ("Sai mật khẩu!");

            var roles = await _userManager.GetRolesAsync(user);
            var token = JwtUtils.GenerateToken(user, roles, 1, _configuration);
            var refreshToken = JwtUtils.GenerateToken(user, roles, 8, _configuration);

            CookieUtils.SetCookie(Response, "token", token, 8);

            //await _auth.SaveRefreshToken(user, refreshToken);

            return Ok(new { message = "Đăng nhập thành công!" });
        }

        [HttpGet("not-responded-invitations/{projectId}")]
        public async Task<ActionResult<List<ProjectInvitations>>> GetUserNotRespondedInvitations()
        {
            Console.WriteLine("GetUserNotRespondedInvitations called");
            var invitations = await _userServices.GetUserNotRespondedInvitations();
            return Ok(invitations);
        }
    }
}