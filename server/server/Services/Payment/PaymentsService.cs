using System.Text.Json;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;
using server.Util;

namespace server.Services.Project
{
    public class PaymentServices : IPayments
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentServices> _logger;

        public PaymentServices(ProjectManagementContext context, IMapper mapper, IConfiguration configuration, ILogger<PaymentServices> logger)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<Payments> SavePaypalPayment(Payments paypalPayment)
        {
            var existed = await _context.Payments
                .FirstOrDefaultAsync(p =>
                    p.Gateway == "Paypal" &&
                    p.GatewayRef == paypalPayment.GatewayRef);

            if (existed != null)
                return existed; 

            await _context.Payments.AddAsync(paypalPayment);
            await _context.SaveChangesAsync();
            return paypalPayment;
        }

        public async Task<decimal> GetLatestFxRates(HttpClient httpClient, string rate)
        {
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri("https://api.fxratesapi.com/latest"),
            };

            using var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);
            decimal vndRate = data.GetProperty("rates").GetProperty(rate.ToUpper()).GetDecimal();

            // return await response.Content.ReadAsStringAsync();
            return vndRate > 0 ? vndRate : 1.0m;
        }
    }
}
