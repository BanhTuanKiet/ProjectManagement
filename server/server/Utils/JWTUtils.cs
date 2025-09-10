using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using server.Models;

namespace server.Util
{
    public class JwtUtils
    {
        public class DecodedToken
        {
            public string UserId { get; set; }
            public string UserRole { get; set; }
        }

        public static string GenerateToken(ApplicationUser user, IList<string> roles, int timeExp, IConfiguration _configuration)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]);

            var tokenHandler = new JwtSecurityTokenHandler();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
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

        public DecodedToken DecodeToken(string token)
        {
            var jwtHandler = new JwtSecurityTokenHandler();
            var jwtToken = jwtHandler.ReadJwtToken(token);

            var nameIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "nameid");
            var roleClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "role");

            if (nameIdClaim == null && roleClaim == null) return null;

            string userId = nameIdClaim.Value;
            string userRole = roleClaim.Value;

            return new DecodedToken { UserId = userId, UserRole = userRole };
        }

        public bool VerifyToken(string token, IConfiguration _configuration)
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