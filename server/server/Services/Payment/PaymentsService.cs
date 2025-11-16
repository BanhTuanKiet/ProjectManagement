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

        public async Task<string> CreatePaymentUrl(HttpContext context, decimal amount, string recordId, string orderType, string orderDescription, string name, OrderDTO.PaypalOrder order)
        {
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_configuration["TimeZoneId"]);
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
            var tick = timeNow.Ticks.ToString();

            var pay = new VnPayUtil();

            var urlCallBack = _configuration["PaymentCallBack:ReturnUrl"];

            pay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"]);
            pay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _configuration["Vnpay:TmnCode"]);
            pay.AddRequestData("vnp_Amount", ((long)amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", pay.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", $"{name} {orderDescription}");
            pay.AddRequestData("vnp_OrderType", orderType);
            pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
            pay.AddRequestData("vnp_TxnRef", recordId);

            var paymentUrl = pay.CreateRequestUrl(
                _configuration["Vnpay:BaseUrl"],
                _configuration["Vnpay:HashSecret"]
            );



            _logger.LogInformation("Generated Payment URL: {PaymentUrl}", paymentUrl);

            return paymentUrl;
        }

        public OrderDTO.VnPayPaymentCallBack PaymentExecute(IQueryCollection collections)
        {
            var pay = new VnPayUtil();
            var response = pay.GetFullResponseData(collections, _configuration["Vnpay:HashSecret"]);

            _logger.LogInformation("Response from VNPAY: {@Response}", response);

            return response;
        }

    }
}
