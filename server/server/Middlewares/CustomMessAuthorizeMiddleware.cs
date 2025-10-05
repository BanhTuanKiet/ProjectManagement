public class CustomAuthorizationMiddleware
{
    private readonly RequestDelegate _next;

    public CustomAuthorizationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        if (context.Response.StatusCode == StatusCodes.Status403Forbidden)
        {
            // Nếu có message custom → trả ra JSON
            if (context.Items.TryGetValue("AuthorizeErrorMessage", out var messageObj))
            {
                var message = messageObj?.ToString();
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { error = message });
            }
        }
    }
}
