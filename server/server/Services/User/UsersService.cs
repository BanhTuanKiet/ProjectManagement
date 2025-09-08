using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Services.User
{
    public class UsersService : IUsers
    {
        public readonly  ProjectManagementContext _context;
        //private readonly IMapper _mapper;

        public UsersService(ProjectManagementContext context)
        {
            _context = context;
            //_mapper = mapper;
        }
        public async Task<List<ApplicationUser>> GetUsers()
        {
            return await _context.ApplicationUsers.ToListAsync();
        }
    }
}
