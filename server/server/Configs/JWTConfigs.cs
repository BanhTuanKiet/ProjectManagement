using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using NuGet.Protocol;
using server.Services;
using server.Util;

namespace server.Configs
{
    public static class JWTConfigs
    {
        public static void AddJWT(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
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
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("✅ OnTokenValidated triggered");
                        var token = context.Request.Cookies["token"];

                        if (!string.IsNullOrEmpty(token))
                        {
                            var jwtHandler = new JwtSecurityTokenHandler();
                            var jwtToken = jwtHandler.ReadJwtToken(token);

                            if (jwtToken != null && jwtToken.Claims != null)
                            {
                                var nameIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "nameid");
                                var roleClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "role");
                                if (nameIdClaim != null && roleClaim != null)
                                {
                                    string userId = nameIdClaim.Value;
                                    string role = roleClaim.Value;

                                    context.HttpContext.Items["UserId"] = userId;
                                    context.HttpContext.Items["role"] = role;
                                }
                            }
                        }
                        return Task.CompletedTask;
                    },
                    OnForbidden = async context =>
                    {
                        Console.WriteLine("⛔ OnForbidden triggered");
                        context.Response.StatusCode = 403;
                        context.Response.ContentType = "application/json";

                        var response = new { ErrorMessage = "Bạn không có quyền truy cập API này!" };
                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                    },
                    OnChallenge = async context =>
                    {
                        Console.WriteLine("⚠️ OnChallenge triggered");
                        context.HandleResponse();
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";

                        var token = context.Request.Cookies["token"];
                        var errorMessage = string.IsNullOrEmpty(token) ? "Vui lòng đăng nhập để tiếp tục!" : "Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại!";
                        await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = errorMessage }));
                        return;
                        if (!string.IsNullOrEmpty(token))
                        {
                            var jwtHandler = new JwtSecurityTokenHandler();
                            var jwtToken = jwtHandler.ReadJwtToken(token);

                            var nameIdClaim = jwtToken?.Claims.FirstOrDefault(c => c.Type == "nameid");
                            var roleClaim = jwtToken?.Claims.FirstOrDefault(c => c.Type == "role");

                            if (nameIdClaim != null && roleClaim != null)
                            {
                                string userId = nameIdClaim.Value;
                                string role = roleClaim.Value;

                                JwtUtils jwtUtils = new JwtUtils();
                                var authService = context.HttpContext.RequestServices.GetRequiredService<server.Services.User.UsersService>();
                                var userService = context.HttpContext.RequestServices.GetRequiredService<UserManager<server.Models.ApplicationUser>>();
                                var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();

                                //var newRefreshToken = await authService.GetRefreshToken(Convert.ToInt32(userId));

                                //if (string.IsNullOrEmpty(newRefreshToken))
                                //{
                                //    await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Không tìm thấy refresh token." }));
                                //    return;
                                //}

                                //if (!authService.VerifyToken(newRefreshToken))
                                //{
                                //    await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." }));
                                //    return;
                                //}

                                var user = await userService.FindByIdAsync(userId);
                                var newToken = JwtUtils.GenerateToken(user, new List<string> { role }, 1, config);
                                CookieUtils.SetCookie(context.Response, "token", newToken, 1);

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