using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Controllers
{
    [Route("users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUsers _userServices;

        public UsersController(IUsers userServices)
        {
            _userServices = userServices;
        }

        [HttpGet("")]
        public async Task<ActionResult> GetUsers()
        {
            List<ApplicationUser> users = await _userServices.GetUsers();
            return Ok(users);
        }
    }
}