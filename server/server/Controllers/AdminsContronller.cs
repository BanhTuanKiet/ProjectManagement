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
        private readonly IPlans _planServices;
        private readonly IConfiguration _configuration;

        public AdminsController(
            IUsers userServices,
            UserManager<ApplicationUser> userManager,
            IPlans planServices,
            IConfiguration configuration)
        {
            _userServices = userServices;
            _userManager = userManager;
            _planServices = planServices;
            _configuration = configuration;
        }

        [HttpGet("users/{page}")]
        public async Task<ActionResult> GetUsers(int page, [FromQuery] UserDTO.UserQuery query)
        {
            const int pageSize = 10;
            int currentPage = page < 0 ? 0 : page;

            var users = await _userServices.GetUsersPaged(currentPage, query);

            if (users.Count() <= 0) return Ok();

            var totalUsers = await _userManager.Users.CountAsync();
            var totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize);

            return Ok(new
            {
                data = users,
                totalPages
            });
        }

        [HttpGet("plans")]
        public async Task<ActionResult> GetPlans([FromQuery] PlanDTO.PlanQuery query)
        {
            var plans = await _planServices.GetPlans();

            if (plans.Count() <= 0) return Ok();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.ToLower();

                var result = plans
                    .Where(p => p.Name.ToLower().Contains(search))
                    .ToList();

                // if (result.Count() <= 0)
                // {
                //     result = plans
                //         .Where(p => p.Features.Any(f =>
                //             f.FeatureName.ToLower().Contains(search)))
                //         .ToList();
                // }

                return Ok(result);
            }

            if (!string.IsNullOrEmpty(query.Direction) && query.Direction == "asc")
            {
                var result = plans.OrderBy(p => p.Name);
            }

            if (!string.IsNullOrEmpty(query.Direction) && query.Direction == "desc")
            {
                var result = plans.OrderByDescending(p => p.Name);
            }

            return Ok(plans);
        }
    }
}