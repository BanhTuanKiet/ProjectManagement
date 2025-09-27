namespace server.Util
{
    public static class CookieUtils
    {
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

        public static string GetCookie(HttpRequest request, string key)
        {
            return request.Cookies[key];
        }
    }
}