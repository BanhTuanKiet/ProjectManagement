using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using System.Text.RegularExpressions;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace server.Services.User
{
    public class UsersService : IUsers
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly Cloudinary _cloudinary;

        public UsersService(ProjectManagementContext context, IMapper mapper, UserManager<ApplicationUser> userManager, Cloudinary cloudinary)
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
        public async Task<ApplicationUser> FindOrCreateUserByEmailAsync(string email, string name)
        {
            var user = await _userManager.FindByEmailAsync(email);
            // string formatedName = name.Replace(" ", "").ToLower();
            string formattedName = Regex.Replace(name ?? email.Split('@')[0], @"[^a-zA-Z0-9]", "").ToLower();

            if (user == null)
            {
                user = new ApplicationUser
                {
                    Email = email,
                    UserName = formattedName
                };

                var result = await _userManager.CreateAsync(user);

                if (!result.Succeeded)
                {
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"Error: {error.Code} - {error.Description}");
                    }
                }

                await _userManager.AddToRoleAsync(user, "User");
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
            user.Facebook = userDto.Facebook ?? user.Facebook;
            user.Instagram = userDto.Instagram ?? user.Instagram;

            var result = await _userManager.UpdateAsync(user);
            return _mapper.Map<UserDTO.UserProfile>(user);
        }

        public async Task<UserDTO.UserProfile> UpdateUserImage(IFormFile file, string userId, string type)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return null;

            if (file == null || file.Length == 0)
                throw new ArgumentException("No file uploaded");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            ImageUploadResult imageResult = null;
            Console.WriteLine($"[UPLOAD DEBUG] FileName: {file.FileName}, Extension: {ext}");

            if (!new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" }.Contains(ext))
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
            return _mapper.Map<UserDTO.UserProfile>(user);=
        }
    }
}
