using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using NuGet.Protocol;
using server.DTO;
using server.Models;
using server.Services;
using server.Util;

namespace server.Configs
{
    public static class JWTConfigs
    {
        public static AuthenticationBuilder AddJWT(this AuthenticationBuilder builder, IConfiguration configuration)
        {
            return builder.AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["JWT:ISSUSER"],
                    ValidAudience = configuration["JWT:AUDIENCE"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:KEY"])),
                    // ClockSkew = TimeSpan.FromMinutes(5)
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        Console.WriteLine("📩 OnMessageReceived triggered");
                        var token = context.Request.Cookies["token"];
                        Console.WriteLine($"Token from cookie: {token}");
                        if (!string.IsNullOrEmpty(token))
                        {
                            context.Token = token;
                        }
                        return System.Threading.Tasks.Task.CompletedTask;
                    },
                    OnTokenValidated = async context =>
                    {
                        Console.WriteLine("✅ OnTokenValidated triggered");

                        var userManager = context.HttpContext.RequestServices
                            .GetRequiredService<UserManager<ApplicationUser>>();

                        var principal = context.Principal;
                        var userId = principal?.FindFirstValue(ClaimTypes.NameIdentifier);

                        var user = await userManager.FindByIdAsync(userId);

                        if (user == null || !user.IsActive)
                        {
                            context.Response.Cookies.Delete("token");
                            context.Fail("Account disabled");
                            return;
                        }

                        context.HttpContext.Items["UserId"] = userId;
                        context.HttpContext.Items["Roles"] =
                            principal.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();
                        context.HttpContext.Items["Name"] =
                            principal.FindFirstValue(ClaimTypes.Name);
                    },
                    OnForbidden = async context =>
                    {
                        Console.WriteLine("⛔ OnForbidden triggered");
                        context.Response.StatusCode = 403;
                        context.Response.ContentType = "application/json";
                        var message = "Only members have access!";
                        var response = new { ErrorMessage = message };

                        if (context.HttpContext.Items.TryGetValue("AuthorizeErrorMessage", out var messageObj))
                        {
                            message = messageObj?.ToString();
                            response = new { ErrorMessage = message };
                        }

                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                    },
                    OnChallenge = async context =>
                    {
                        Console.WriteLine("⚠️ OnChallenge triggered");
                        context.HandleResponse();
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";

                        var token = context.Request.Cookies["token"];
                        var errorMessage = string.IsNullOrEmpty(token) ? "Please login to continue!" : "Your session has expired. Please log in again.";

                        if (!string.IsNullOrEmpty(token))
                        {
                            TokenDTO.DecodedToken decodedToken = JwtUtils.DecodeToken(token);
                            Console.WriteLine("Decode" + decodedToken.roles.Count());
                            if (decodedToken.userId != null && decodedToken.roles != null && decodedToken.name != null)
                            {
                                var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();
                                var userService = context.HttpContext.RequestServices.GetRequiredService<IUsers>();
                                var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();

                                var refreshToken = await userService.GetRefreshToken(decodedToken.userId);

                                if (string.IsNullOrEmpty(refreshToken))
                                {
                                    await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Your session has expired. Please log in again." }));
                                    return;
                                }

                                if (!JwtUtils.VerifyToken(refreshToken, config))
                                {
                                    await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Your session has expired. Please log in again." }));
                                    return;
                                }

                                var user = await userManager.FindByIdAsync(decodedToken.userId);
                                var newToken = JwtUtils.GenerateToken(user, decodedToken.roles, 1, config);
                                CookieUtils.SetCookie(context.Response, "token", newToken, 1);
                                Console.WriteLine("New token: " + newToken);
                                await context.Response.WriteAsync(JsonSerializer.Serialize(new
                                {
                                    RetryRequest = true,
                                }));

                                return;
                            }
                        }

                        await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = errorMessage }));
                    },
                };
            });
        }
    }
}