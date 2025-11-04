using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services.Backlog;
using server.Models;
using server.Configs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Security.Claims;
using System.Globalization;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class PaymentsController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly IPayments _paymentsService;
        private readonly ISubscriptions _subscriptionsService;

        public PaymentsController(IConfiguration config, IHttpClientFactory httpClientFactory, IPayments paymentsService, ISubscriptions subscriptionsService)
        {
            _config = config;
            _httpClient = httpClientFactory.CreateClient();
            _paymentsService = paymentsService;
            _subscriptionsService = subscriptionsService;
        }

        [HttpPost("checkout/paypal")]
        public async Task<ActionResult> CheckoutPaypal([FromBody] OrderDTO.PaypalOrder order)
        {
            var clientId = _config["PaypalSettings:ClientId"];
            var secret = _config["PaypalSettings:Secret"];
            var baseUrl = _config["PaypalSettings:BaseUrl"];

            string returnUrl = $"http://localhost:3000/plan-payment/payment-result?status=true";
            string cancelUrl = $"http://localhost:3000/plan-payment/payment-result?status=false";

            order.ReturnUrl = returnUrl;
            order.CancelUrl = cancelUrl;

            decimal vndRate = await _paymentsService.GetLatestFxRates(_httpClient, "VND");
            decimal usdRate = await _paymentsService.GetLatestFxRates(_httpClient, "USD");
            decimal finalVndRate = vndRate * usdRate;

            decimal finalPrice = order.BillingPeriod == "monthly" ? order.Amount : order.Amount * 12 * 0.95m;
            string finalPriceString = (finalPrice / finalVndRate).ToString("F2", CultureInfo.InvariantCulture);
            order.Amount = decimal.Parse(finalPriceString, CultureInfo.InvariantCulture);

            var jsonOrder = JsonSerializer.Serialize(order);
            var encodedOrder = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(jsonOrder));

            returnUrl += $"&order={encodedOrder}";
            cancelUrl += $"&order={encodedOrder}";

            var authToken = Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes($"{clientId}:{secret}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);

            var tokenResponse = await _httpClient.PostAsync($"{baseUrl}/v1/oauth2/token",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "grant_type", "client_credentials" }
                }));

            var tokenJson = await tokenResponse.Content.ReadAsStringAsync();
            var tokenData = JsonSerializer.Deserialize<JsonElement>(tokenJson);
            var accessToken = tokenData.GetProperty("access_token").GetString();

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var orderPayload = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new {
                        amount = new {
                            currency_code = order.Currency ?? "USD",
                            value = finalPriceString
                        }
                    }
                },
                application_context = new
                {
                    brand_name = "realtime_platform",
                    landing_page = "LOGIN",
                    user_action = "PAY_NOW",
                    return_url = returnUrl,
                    cancel_url = cancelUrl
                }
            };

            var response = await _httpClient.PostAsJsonAsync($"{baseUrl}/v2/checkout/orders", orderPayload);
            var result = await response.Content.ReadAsStringAsync();

            return Ok(result);
        }

        [HttpPost("capture-order")]
        public async Task<IActionResult> CaptureOrder([FromBody] OrderDTO.PaypalCaptureRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var clientId = _config["PaypalSettings:ClientId"];
            var secret = _config["PaypalSettings:Secret"];
            var baseUrl = _config["PaypalSettings:BaseUrl"];

            var authToken = Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes($"{clientId}:{secret}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);

            var tokenResponse = await _httpClient.PostAsync($"{baseUrl}/v1/oauth2/token", new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "grant_type", "client_credentials" }
            }));

            var tokenJson = await tokenResponse.Content.ReadAsStringAsync();
            var tokenData = JsonSerializer.Deserialize<JsonElement>(tokenJson);
            var accessToken = tokenData.GetProperty("access_token").GetString();

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var captureUrl = $"{baseUrl}/v2/checkout/orders/{request.OrderId}/capture";
            var captureResponse = await _httpClient.PostAsJsonAsync(captureUrl, new { });
            var captureResult = await captureResponse.Content.ReadAsStringAsync();
            DateTime expiredAt = DateTime.UtcNow;

            Payments paypal = new Payments
            {
                UserId = userId,
                Amount = request.Amount,
                Currency = "USD",
                Gateway = "Paypal",
                GatewayRef = request.OrderId,
                Status = "Paid",
                Description = request.Description,
            };

            Payments payments = await _paymentsService.SavePaypalPayment(paypal);

            Subscriptions subscriptions = new Subscriptions
            {
                UserId = userId,
                PlanId = request.PlanId,
                PaymentId = payments.Id,
                ExpiredAt = request.BillingPeriod == "monthly" ? expiredAt.AddMonths(1) : expiredAt.AddYears(1)
            };

            await _subscriptionsService.AddSubscription(subscriptions);

            return Ok(new { captureResponse = captureResponse, subscriptions = subscriptions });
        }
    }
}