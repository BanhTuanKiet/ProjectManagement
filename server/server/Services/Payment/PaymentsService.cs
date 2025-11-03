using System.Text.Json;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;

namespace server.Services.Project
{
    public class PaymentsService : IPayments
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public PaymentsService(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Payments> SavePaypalPayment(Payments paypalPayment)
        {
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
