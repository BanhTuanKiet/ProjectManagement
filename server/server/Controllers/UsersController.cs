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

        [HttpGet("signin-google")]
        public IActionResult SignGoogle(string returnUrl = "http://localhost:3000/project")
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action("GoogleCallback", "Auth", new { returnUrl })
            };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        //[HttpGet("google-callback")]
        //public async Task<IActionResult> GoogleCallback(string returnUrl)
        //{
        //    Console.WriteLine("AAAAAAAAAAAAAA");

        //    var authResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        //    if (!authResult.Succeeded)
        //        return BadRequest("Google authentication failed");

        //    var email = authResult.Principal.FindFirstValue(ClaimTypes.Email);
        //    var name = authResult.Principal.FindFirstValue(ClaimTypes.Name);

        //    Console.WriteLine(email);
        //    Console.WriteLine(name);

        //    return Redirect(returnUrl ?? "http://localhost:3000/project");
        //}

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