using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using System.Text.RegularExpressions;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using server.Configs;
using server.DTO;
using AutoMapper.QueryableExtensions;

namespace server.Services.User
{
    public class UserServices : IUsers
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly Cloudinary _cloudinary;

        public UserServices(ProjectManagementContext context, IMapper mapper, UserManager<ApplicationUser> userManager, Cloudinary cloudinary)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
            _cloudinary = cloudinary;
        }
        public async Task<List<ApplicationUser>> GetUsers()
        {
            return await _context.ApplicationUsers.ToListAsync();
        }

        public async Task<List<UserDTO.User>> GetUsersPaged(int page, UserDTO.UserQuery query)
        {
            const int amount = 10;
            int skip = page * amount;

            var usersQuery = _context.Users
                .Include(u => u.Subscription)
                    .ThenInclude(s => s.Plan)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                usersQuery = usersQuery.Where(u =>
                    (u.UserName != null && u.UserName.Contains(query.Search)) ||
                    (u.Email != null && u.Email.Contains(query.Search)));
            }

            if (!string.IsNullOrWhiteSpace(query.Plan) && !query.Plan.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                var plan = query.Plan.ToLower();

                if (plan == "free")
                {
                    usersQuery = usersQuery.Where(u => u.Subscription == null || u.Subscription.Plan.Name.ToLower() == "free");
                }
                else
                {
                    usersQuery = usersQuery.Where(u => u.Subscription != null && u.Subscription.Plan.Name.ToLower() == plan);
                }
            }

            if (!string.IsNullOrWhiteSpace(query.IsActive) && !query.IsActive.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                usersQuery = usersQuery.Where(u => u.IsActive == (query.IsActive.ToLower() == "active"));
            }

            if (!string.IsNullOrEmpty(query.Direction))
            {
                usersQuery = query.Direction == "asc"
                    ? usersQuery.OrderBy(u => u.UserName)
                    : usersQuery.OrderByDescending(u => u.UserName);
            }

            var users = await usersQuery
                .Skip(skip)
                .Take(amount)
                .ToListAsync();

            var usersMapped = _mapper.Map<List<UserDTO.User>>(users);

            return usersMapped;
        }

        public async Task<ApplicationUser> FindOrCreateUserByEmailAsync(string email, string name)
        {
            if (string.IsNullOrEmpty(email))
                throw new ErrorException(400, "Email is required");

            var user = await _context.ApplicationUsers
                .Include(u => u.Subscription)
                .ThenInclude(s => s.Plan)
                .FirstOrDefaultAsync(u => u.Email == email);

            // Tạo UserName hợp lệ, fallback nếu trùng
            string baseUserName = Regex.Replace(name ?? email.Split('@')[0], @"[^a-zA-Z0-9]", "").ToLower();
            string finalUserName = baseUserName;
            int suffix = 1;

            while (await _userManager.FindByNameAsync(finalUserName) != null)
            {
                finalUserName = $"{baseUserName}{suffix}";
                suffix++;
            }

            if (user == null)
            {
                user = new ApplicationUser
                {
                    Email = email,
                    UserName = finalUserName
                };

                var result = await _userManager.CreateAsync(user);

                if (!result.Succeeded)
                {
                    var messages = string.Join(" | ", result.Errors.Select(e => $"{e.Code}: {e.Description}"));
                    throw new ErrorException(400, "Failed to create user: " + messages);
                }

                // Thêm role mặc định "User"
                var roleResult = await _userManager.AddToRoleAsync(user, "User");
                if (!roleResult.Succeeded)
                {
                    var messages = string.Join(" | ", roleResult.Errors.Select(e => $"{e.Code}: {e.Description}"));
                    throw new ErrorException(400, "Failed to add role: " + messages);
                }
            }

            return user;
        }

        public async Task<string> GetRefreshToken(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            return user.RefreshToken;
        }

        public async Task<bool> SaveRefreshToken(string userId, string token)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            user.RefreshToken = token;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> CheckLogin(string email, string password)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return false;

                return await _userManager.CheckPasswordAsync(user, password);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi check login: {ex.Message}");
                return false;
            }
        }

        public async Task<List<ProjectInvitations>> GetUserNotRespondedInvitations()
        {
            return await _context.ProjectInvitations
                .Where(invitation => invitation.IsAccepted == false)
                .ToListAsync();
        }

        public async Task<ApplicationUser> FindUserById(string id)
        {
            return await _userManager.FindByIdAsync(id);
        }

        public async Task<ApplicationUser> GetUserById(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return user;
        }

        public async Task<UserDTO.UserProfile> UpdateUser(UserDTO.UserProfile userDto, string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            user.UserName = userDto.UserName ?? user.UserName;
            user.Email = userDto.Email ?? user.Email;
            user.PhoneNumber = userDto.PhoneNumber ?? user.PhoneNumber;
            user.JobTitle = userDto.JobTitle ?? user.JobTitle;
            user.Department = userDto.Department ?? user.Department;
            user.Organization = userDto.Organization ?? user.Organization;
            user.Location = userDto.Location ?? user.Location;

            var result = await _userManager.UpdateAsync(user);
            return _mapper.Map<UserDTO.UserProfile>(user);
        }

        public async Task<UserDTO.UserProfile> UpdateUserImage(IFormFile file, string userId, string type)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
                return null;

            if (file == null || file.Length == 0)
                throw new ArgumentException("No file uploaded");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            ImageUploadResult imageResult = null;
            Console.WriteLine($"[UPLOAD DEBUG] FileName: {file.FileName}, Extension: {ext}");

            if (new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" }.Contains(ext))
            {
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, file.OpenReadStream()),
                    Folder = "ProjectManagement/Tasks",
                    PublicId = $"{userId}_{type}_{Guid.NewGuid()}"
                };
                imageResult = await _cloudinary.UploadAsync(uploadParams);
            }

            Console.WriteLine("Upload result: " + imageResult.ToString());
            var fileUrl = imageResult?.SecureUrl?.ToString();
            Console.WriteLine("Uploaded file URL: " + fileUrl);

            if (string.IsNullOrEmpty(fileUrl))
                throw new Exception("Upload failed or URL missing.");

            if (type == "avatar")
                user.AvatarUrl = fileUrl;
            else if (type == "imagecover")
                user.ImageCoverUrl = fileUrl;

            await _userManager.UpdateAsync(user);
            return _mapper.Map<UserDTO.UserProfile>(user);
        }

        public async Task<ProjectMember> GetProjectRole(int projectId, string userId)
        {
            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.Project.ProjectId == projectId && pm.User.Id == userId);

            return member;
        }

        public async Task<List<ApplicationUser>> FindUserListByIds(List<string> ids)
        {
            var users = await _userManager.Users
                .Where(u => ids.Contains(u.Id))
                .ToListAsync();
            return users;
        }

        public async Task<bool> DeleteMembers(int projectId, List<string> userIds)
        {
            var members = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == projectId && userIds.Contains(pm.UserId))
                .ToListAsync();

            if (!members.Any())
                return false;

            _context.ProjectMembers.RemoveRange(members);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Subscriptions> GetSubscriptions(string userId)
        {
            return await _context.Subscriptions.Include(s => s.Plan).FirstOrDefaultAsync(s => s.UserId == userId);
        }

        public async Task<UserDTO.UserProfile2> GetUserProfile(string userId)
        {
            var user = await _context.ApplicationUsers
                .Include(u => u.Subscription)
                    .ThenInclude(s => s.Plan)
                .Include(u => u.Contacts)
                    .ThenInclude(c => c.Media)
                .FirstOrDefaultAsync(u => u.Id == userId);

            var projects = await _context.Projects
                .Include(p => p.ProjectMembers)
                .Include(p => p.CreatedByNavigation)
                .Where(p => p.ProjectMembers.Any(pm => pm.UserId == userId))
                .ToListAsync();

            var userDto = _mapper.Map<UserDTO.UserProfile2>(user);

            userDto.Projects = projects.Select(project =>
            {
                var projectDto = _mapper.Map<ProjectDTO.ProjectBasic>(project);

                var role = project.ProjectMembers
                    .FirstOrDefault(pm => pm.UserId == userId)
                    ?.RoleInProject;

                projectDto.Role = role;
                projectDto.Members = null;

                return projectDto;
            }).ToList();

            return userDto;
        }

        public async Task<ApplicationUser> PutInfoProfile(ApplicationUser user, UserDTO.InfoProfile infoProfile)
        {
            user.UserName = infoProfile.Name;
            user.Location = infoProfile.Location;
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<(ApplicationUser user, bool isNewUser)> FindOrCreateUserByEmail(string email, string name)
        {
            if (string.IsNullOrEmpty(email))
                throw new ErrorException(400, "Email is required");

            var user = await _context.ApplicationUsers
                .Include(u => u.Subscription)
                .ThenInclude(s => s.Plan)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user != null)
            {
                return (user, false);
            }

            string baseUserName = Regex
                .Replace(name ?? email.Split('@')[0], @"[^a-zA-Z0-9]", "")
                .ToLower();

            string finalUserName = baseUserName;
            int suffix = 1;

            while (await _userManager.FindByNameAsync(finalUserName) != null)
            {
                finalUserName = $"{baseUserName}{suffix}";
                suffix++;
            }

            user = new ApplicationUser
            {
                Email = email,
                UserName = finalUserName,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
            {
                var messages = string.Join(" | ",
                    result.Errors.Select(e => $"{e.Code}: {e.Description}"));
                throw new ErrorException(400, "Failed to create user: " + messages);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, "User");
            if (!roleResult.Succeeded)
            {
                var messages = string.Join(" | ",
                    roleResult.Errors.Select(e => $"{e.Code}: {e.Description}"));
                throw new ErrorException(400, "Failed to add role: " + messages);
            }

            return (user, true);
        }

    }
}
