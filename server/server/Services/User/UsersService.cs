using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using System.Text.RegularExpressions;

namespace server.Services.User
{
    public class UsersService : IUsers
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        public UsersService(ProjectManagementContext context, IMapper mapper, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
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
            Console.WriteLine("GetUserNotRespondedInvitations in service called");
            return await _context.ProjectInvitations
                .Where(invitation => invitation.IsAccepted == false)
                .ToListAsync();
        }
    }
}
