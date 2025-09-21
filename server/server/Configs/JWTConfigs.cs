using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
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
                        var roles = principal.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

                        Console.WriteLine($"UserId: {userId}, Roles: {string.Join(",", roles)}");

                        context.HttpContext.Items["UserId"] = userId;
                        context.HttpContext.Items["Roles"] = roles;

                        return System.Threading.Tasks.Task.CompletedTask;
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
                        var errorMessage = string.IsNullOrEmpty(token) ? "Please login to continue!" : "Your session has expired. Please log in again.";

                        if (!string.IsNullOrEmpty(token))
                        {
                            TokenDTO.DecodedToken decodedToken = DecodeToken(token);

                            if (decodedToken.userId != null && decodedToken.roles != null)
                            {

                                var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();
                                var userService = context.HttpContext.RequestServices.GetRequiredService<IUsers>();
                                var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();

                                var refreshToken = await userService.GetRefreshToken(decodedToken.userId);

                                if (string.IsNullOrEmpty(refreshToken))
                                {
                                    await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Refresh token not found." }));
                                    return;
                                }

                                if (!VerifyToken(refreshToken, config))
                                {
                                    await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Your session has expired. Please log in again." }));
                                    return;
                                }

                                var user = await userManager.FindByIdAsync(decodedToken.userId);
                                var newToken = GenerateToken(user, decodedToken.roles, 1, config);
                                CookieConfig.SetCookie(context.Response, "token", newToken, 1);

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

        public static string GenerateToken(ApplicationUser user, List<string> roles, int timeExp, IConfiguration _configuration)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["JWT:KEY"]);

            var tokenHandler = new JwtSecurityTokenHandler();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
            claims.Add(new Claim(ClaimTypes.Role, "Member"));
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(timeExp),
                Issuer = _configuration["JWT:ISSUSER"],
                Audience = _configuration["JWT:AUDIENCE"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            string jwtToken = tokenHandler.WriteToken(token);

            return jwtToken;
        }

        public static TokenDTO.DecodedToken DecodeToken(string token)
        {
            var jwtHandler = new JwtSecurityTokenHandler();
            var jsonToken = jwtHandler.ReadJwtToken(token);

            Claim nameIdClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            List<string> roleClaims = jsonToken.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();

            return new TokenDTO.DecodedToken
            {
                userId = nameIdClaim?.Value,
                roles = roleClaims
            };
        }

        public static bool VerifyToken(string token, IConfiguration _configuration)
        {
            try
            {
                var jwtHandler = new JwtSecurityTokenHandler();
                var jwtToken = jwtHandler.ReadJwtToken(token);
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = "http://127.0.0.1:5144",
                    ValidAudience = "http://127.0.0.1:3000",
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:KEY"])),
                };
                var claimsPrincipal = jwtHandler.ValidateToken(token, tokenValidationParameters, out var validatedToken);
                var decodedToken = (JwtSecurityToken)validatedToken;

                return true;
            }
            catch (SecurityTokenException ex)
            {
                return false;
            }
        }
    }
}