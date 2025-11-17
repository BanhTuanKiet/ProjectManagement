using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using server.DTO;
using server.Models;

namespace server.Util
{
    public static class JwtUtils
    {
        public static string GenerateToken(ApplicationUser user, IList<string> roles, int timeExp, IConfiguration _configuration)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["JWT:KEY"]);

            var tokenHandler = new JwtSecurityTokenHandler();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? user.Id.ToString()),
                new Claim("plan_id", user?.Subscription?.PlanId.ToString() ?? "1"),
                new Claim("plan_name", user?.Subscription?.Plan?.Name ?? "Free"),
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

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

        public static TokenDTO.DecodedToken DecodeToken(string token)
        {
            var jwtHandler = new JwtSecurityTokenHandler();
            var jsonToken = jwtHandler.ReadJwtToken(token);

            var nameIdClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid");
            var nameClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name || c.Type == "unique_name");
            var emailClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == "email");
            var planIdClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "plan_id");
            var planNameClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "plan_name");

            List<string> roleClaims = jsonToken.Claims
                .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
                .Select(c => c.Value)
                .ToList();

            return new TokenDTO.DecodedToken
            {
                userId = nameIdClaim?.Value ?? "",
                name = nameClaim?.Value ?? "",
                roles = roleClaims ?? [],
                Email = emailClaim?.Value ?? "",
                PlanId = planIdClaim?.Value ?? "",
                PlanName = planNameClaim?.Value ?? ""
            };
        }
    }
}