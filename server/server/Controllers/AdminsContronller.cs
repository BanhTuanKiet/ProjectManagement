using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using server.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using server.Configs;
using server.Util;
using server.DTO;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using server.Services.Task;
using Microsoft.EntityFrameworkCore;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    // [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    // [Authorize(Roles = "admin")]
    public class AdminsController : ControllerBase
    {
        private readonly IUsers _userServices;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public AdminsController(
            IUsers userServices,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration)
        {
            _userServices = userServices;
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpGet("users/{page}")]
        public async Task<ActionResult> GetUsers(int page, [FromQuery] UserDTO.UserQuery query)
        {
            var users = await _userServices.GetUsersPaged(page > 0 ? page : 1, query);

            return Ok(users);
        }
    }
}