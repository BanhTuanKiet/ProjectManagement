using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using server.Models;
using server.Util;

namespace server.Configs
{
    public static class AuthConfig
    {
        public static AuthenticationBuilder AddGoogleAuth(this AuthenticationBuilder builder, IConfiguration configuration)
        {
            builder.AddGoogle(options =>
            {
                options.ClientId = configuration["Authentication:Google:ClientId"];
                options.ClientSecret = configuration["Authentication:Google:ClientSecret"];
                options.CallbackPath = "/users/signin-google/google-callback";
                options.SaveTokens = true;
                options.AccessType = "offline";
                options.Scope.Add("email");
                options.Scope.Add("profile");

                options.Events.OnTicketReceived = async context =>
                {
                    var email = context.Principal.FindFirstValue(ClaimTypes.Email);
                    var name = context.Principal.FindFirstValue(ClaimTypes.Name);

                    var userService = context.HttpContext.RequestServices.GetRequiredService<IUsers>();
                    var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();

                    var user = await userService.FindOrCreateUserByEmailAsync(email, name);
                    var roles = await userManager.GetRolesAsync(user);
                    var accessToken = JwtUtils.GenerateToken(user, roles, 1, configuration);
                    var refreshToken = JwtUtils.GenerateToken(user, roles, 24, configuration);

                    CookieConfig.SetCookie(context.Response, "token", accessToken, 24);
                    await userService.SaveRefreshToken(user.Id, refreshToken);

                    context.Response.Redirect("http://localhost:3000/project");
                    context.HandleResponse();
                };
            });

            return builder;
        }
    }
}
