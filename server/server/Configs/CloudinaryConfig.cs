using CloudinaryDotNet;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace server.Configs
{
    public static class CloudinaryConfig
    {
        public static IServiceCollection AddCloudinary(this IServiceCollection services, IConfiguration configuration)
        {
            var account = new Account(
                configuration["CloudinarySettings:CloudName"],
                configuration["CloudinarySettings:ApiKey"],
                configuration["CloudinarySettings:ApiSecret"]
            );

            var cloudinary = new Cloudinary(account);
            cloudinary.Api.Secure = true;

            services.AddSingleton(cloudinary);


            return services;
        }
    }
}
