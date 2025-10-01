using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;

namespace server.Configs
{
    public static class CookieConfig
    {
        // public static AuthenticationBuilder AddAppCookie(this AuthenticationBuilder builder)
        // {
        //     builder.AddCookie(options =>
        //     {
        //         options.Cookie.SameSite = SameSiteMode.None;
        //         options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

        //         options.Events.OnRedirectToLogin = context =>
        //         {
        //             context.Response.StatusCode = 401;
        //             return Task.CompletedTask;
        //         };

        //         options.Events.OnRedirectToAccessDenied = context =>
        //         {
        //             context.Response.StatusCode = 403;
        //             return Task.CompletedTask;
        //         };
        //     });

        //     return builder;
        // }
        public static void SetCookie(HttpResponse response, string key, string value, int expireTime)
        {
            CookieOptions option = new CookieOptions()
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTime.UtcNow.AddHours(expireTime),
            };
            response.Cookies.Append(key, value, option);
        }

        public static void RemoveCookie(HttpResponse response, string key)
        {
            response.Cookies.Delete(key);
        }

        public static string GetCookie(HttpRequest request, string key)
        {
            return request.Cookies[key];
        }
    }
}
