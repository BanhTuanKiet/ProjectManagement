public static class MiddlewareConfig
{
    public static void MiddlewareCustom(this IApplicationBuilder app)
    {
        app.UseMiddleware<ErrorHandlingMiddleware>();
        app.UseMiddleware<LoadContextMiddleware>();
        app.UseMiddleware<CustomAuthorizationMiddleware>();
    }
}
