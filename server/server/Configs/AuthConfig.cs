using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
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
                    context.Properties.Items.TryGetValue("invite_token", out var token);

                    var userService = context.HttpContext.RequestServices.GetRequiredService<IUsers>();
                    var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();

                    var user = await userService.FindOrCreateUserByEmailAsync(email, name);
                    var roles = await userManager.GetRolesAsync(user);

                    var accessToken = JwtUtils.GenerateToken(user, roles, 1, configuration);
                    var refreshToken = JwtUtils.GenerateToken(user, roles, 24, configuration);

                    CookieUtils.SetCookie(context.Response, "token", accessToken, 24);
                    await userService.SaveRefreshToken(user.Id, refreshToken);

                    if (!string.IsNullOrEmpty(token))
                    {
                        var db = context.HttpContext.RequestServices.GetRequiredService<ProjectManagementContext>();
                        if (token != null)
                        {
                            var invitation = await db.ProjectInvitations
                                .FirstOrDefaultAsync(i => i.Email == token && i.IsAccepted == false);

                            if (invitation != null && 
                                invitation.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
                            {
                                var existed = await db.ProjectMembers
                                    .AnyAsync(pm => pm.ProjectId == invitation.ProjectId && pm.UserId == user.Id);

                                if (!existed)
                                {
                                    db.ProjectMembers.Add(new ProjectMember
                                    {
                                        ProjectId = invitation.ProjectId,
                                        UserId = user.Id,
                                        RoleInProject = invitation.RoleInProject,
                                        JoinedAt = DateTime.UtcNow
                                    });
                                }

                                invitation.IsAccepted = true;
                                await db.SaveChangesAsync();

                                context.Response.Redirect($"http://localhost:3000/project/{invitation.ProjectId}?joined=true");
                                context.HandleResponse();
                                return;
                            }
                        }
                    }

                    context.Response.Redirect("http://localhost:3000/project?success=true");
                    context.HandleResponse();
                };

                options.Events.OnRemoteFailure = context =>
                {
                    context.Response.Redirect("http://localhost:3000/project?success=false");
                    context.HandleResponse();
                    return System.Threading.Tasks.Task.CompletedTask;
                };
            });

            return builder;
        }
    }
}
