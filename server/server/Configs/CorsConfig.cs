namespace server.Configs
{
    public static class CorsConfig
    {
        public static void CorsPolicy(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("_allowSpecificOrigins", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "http://192.168.2.2:3000")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });
        }
    }
}
