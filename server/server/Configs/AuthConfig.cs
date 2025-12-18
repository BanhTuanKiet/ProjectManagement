using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
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

                    Console.WriteLine("GOOGLE EMAIL: " + email);
                    Console.WriteLine("GOOGLE NAME: " + name);

                    var userService = context.HttpContext.RequestServices.GetRequiredService<IUsers>();
                    var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();
                    var subscriptionService = context.HttpContext.RequestServices.GetRequiredService<ISubscriptions>();
                    var db = context.HttpContext.RequestServices.GetRequiredService<ProjectManagementContext>();

                    var (user, isNewUser) = await userService.FindOrCreateUserByEmail(email, name);

                    if (isNewUser)
                    {
                        var subscription = new Subscriptions
                        {
                            UserId = user.Id,
                            PlanId = 1,
                            PaymentId = null,
                            ExpiredAt = DateTime.UtcNow.AddYears(1)
                        };

                        await subscriptionService.AddSubscription(subscription);
                    }
                    var roles = await userManager.GetRolesAsync(user);

                    // Tạo token
                    var accessToken = JwtUtils.GenerateToken(user, roles, 1, configuration);
                    var refreshToken = JwtUtils.GenerateToken(user, roles, 24, configuration);

                    // Lưu cookie
                    CookieUtils.SetCookie(context.Response, "token", accessToken, 24);
                    await userService.SaveRefreshToken(user.Id, refreshToken);

                    // Kiểm tra invitation (nếu có)
                    context.Properties.Items.TryGetValue("email", out var token);
                    context.Properties.Items.TryGetValue("projectId", out var projectIdStr);
                    int.TryParse(projectIdStr, out int projectId);

                    if (!string.IsNullOrEmpty(token))
                    {
                        var invitation = await db.ProjectInvitations
                            .FirstOrDefaultAsync(i => i.Email == token && i.IsAccepted == false && i.ProjectId == projectId);

                        if (invitation == null)
                            throw new ErrorException(400, "Invitation not find");

                        if (invitation != null && invitation.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
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

                            if (invitation.RoleInProject == "Leader")
                            {
                                var teamServices = context.HttpContext.RequestServices.GetRequiredService<ITeams>();
                                Teams team = await teamServices.CreateTeam(user.Id, invitation.ProjectId);

                                if (team == null)
                                {
                                    context.Response.Redirect($"http://localhost:3000/project/{invitation.ProjectId}?joined=true");
                                    context.HandleResponse();
                                    return;
                                }
                            }

                            invitation.IsAccepted = true;
                            await db.SaveChangesAsync();

                            context.Response.Redirect($"http://localhost:3000/project/{invitation.ProjectId}?joined=true");
                            context.HandleResponse();
                            return;
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
