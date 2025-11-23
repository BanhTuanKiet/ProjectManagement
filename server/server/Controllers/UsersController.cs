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
using Microsoft.Build.Framework;
using server.Services.Task;
using Microsoft.EntityFrameworkCore;
using server.Services.User;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUsers _userServices;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IHubContext<PresenceHubConfig> _hubContext;
        public readonly ProjectManagementContext _context;
        public readonly ITasks _taskService;
        public UsersController(
            IUsers userServices,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            IHubContext<PresenceHubConfig> hubContext,
            ProjectManagementContext context,
            ITasks taskService)
        {
            _userServices = userServices;
            _userManager = userManager;
            _configuration = configuration;
            _hubContext = hubContext;
            _context = context;
            _taskService = taskService;
        }

        [HttpGet("signin-google")]
        public IActionResult SignGoogle(string? email = null, string returnUrl = "http://localhost:3000/project")
        {
            if (string.IsNullOrEmpty(returnUrl))
            {
                var configReturnUrl = _configuration["Authentication:Google:ReturnUrl"];
                returnUrl = configReturnUrl ?? "/";
            }

            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action("GoogleCallback", "Auth", new { returnUrl }),
                Items = { { "email", email ?? "" } }
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

        [HttpGet("role/{projectId}")]
        public async Task<ActionResult> GetProjectRole(int projectId)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            ProjectMember member = await _userServices.GetProjectRole(projectId, userId) ?? throw new ErrorException(404, "Member not found");
            return Ok(member.RoleInProject);
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

        [HttpGet("profile")]
        public async Task<ActionResult<ApplicationUser>> GetUserById()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userServices.GetUserById(userId);
            return Ok(user);
        }

        [HttpPut("editProfile")]
        public async Task<ActionResult<ApplicationUser>> UpdateUser([FromBody] UserDTO.UserProfile profile)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var updatedUser = await _userServices.UpdateUser(profile, userId);
            if (updatedUser == null)
            {
                throw new ErrorException(500, "Update profile failed");
            }
            return Ok(new { message = "Edit profile successfully" });
        }

        [HttpPost("upload/{type}")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, string type)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new ErrorException(401, "Unauthorized: missing user ID.");

            if (file == null || file.Length == 0)
                throw new ErrorException(400, "File is missing or empty.");

            if (type != "avatar" && type != "imagecover")
                throw new ErrorException(400, "Invalid image type. Must be 'avatar' or 'imagecover'.");

            var uploadedFile = await _userServices.UpdateUserImage(file, userId, type);

            if (uploadedFile == null)
                throw new ErrorException(500, "File upload failed.");

            return Ok(uploadedFile);
        }

        [HttpDelete("{projectId}")]
        [Authorize(Policy = "PMRequirement")]
        public async Task<ActionResult> DeleteMembers([FromBody] List<string> userIds, int projectId)
        {
            if (userIds == null || userIds.Count == 0)
                throw new ErrorException(400, "The list to delete must not be empty");

            foreach (var uid in userIds)
            {
                ProjectMember member = await _userServices.GetProjectRole(projectId, uid);

                if (member.RoleInProject == "Leader")
                {
                    throw new ErrorException(400, $"User {uid} is the Leader and cannot be removed");
                }
            }

            foreach (var uid in userIds)
            {
                List<TaskDTO.BasicTask> tasks = await _taskService.GetTaskByUserId(uid, projectId);

                if (tasks.Count > 0)
                {
                    var user = await _context.ApplicationUsers
                        .Where(u => u.Id == uid)
                        .Select(u => u.UserName)
                        .FirstOrDefaultAsync();

                    string userName = user ?? uid;

                    throw new ErrorException(
                        400,
                        $"Cannot delete member '{userName}' because it has received {tasks.Count} task(s) in the project"
                    );
                }
            }

            bool isDeleted = await _userServices.DeleteMembers(projectId, userIds);
            if (!isDeleted) throw new ErrorException(400, "Removed failed");
            return Ok(new { userIds = userIds, message = "Removed successfully" });
        }

            [HttpGet("subscription")]
            public async Task<ActionResult> GetSubscriptions()
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Subscriptions subscription = await _userServices.GetSubscriptions(userId);
                return Ok(subscription.Plan.Name);
            }
    }
}