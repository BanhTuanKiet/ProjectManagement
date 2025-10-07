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
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:KEY"]))
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
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("✅ OnTokenValidated triggered");

                        var principal = context.Principal;
                        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
                        var name = principal.FindFirstValue(ClaimTypes.Name);
                        var roles = principal.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

                        Console.WriteLine($"UserId: {userId}, Roles: {string.Join(",", roles)}");

                        context.HttpContext.Items["UserId"] = userId;
                        context.HttpContext.Items["Roles"] = roles;
                        context.HttpContext.Items["name"] = name;

                        return System.Threading.Tasks.Task.CompletedTask;
                    },
                    OnForbidden = async context =>
                    {
                        Console.WriteLine("⛔ OnForbidden triggered");
                        context.Response.StatusCode = 403;
                        context.Response.ContentType = "application/json";

                        var response = new { ErrorMessage = "Only members have access!" };
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
                        Console.WriteLine("Token is expired: " + token);
                        if (!string.IsNullOrEmpty(token))
                        {
                            Console.WriteLine("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");

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
                                Console.WriteLine("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                                var user = await userManager.FindByIdAsync(decodedToken.userId);
                                var newToken = JwtUtils.GenerateToken(user, decodedToken.roles, 1, config);
                                CookieConfig.SetCookie(context.Response, "token", newToken, 1);
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