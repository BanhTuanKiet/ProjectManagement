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

        public PaymentsController(IConfiguration config, IHttpClientFactory httpClientFactory, IPayments paymentsService)
        {
            _config = config;
            _httpClient = httpClientFactory.CreateClient();
            _paymentsService = paymentsService;
        }

        [HttpPost("checkout/paypal")]
        public async Task<ActionResult> CheckoutPaypal([FromBody] OrderDTO.PaypalOrder order)
        {
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

            var orderPayload = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new {
                        // description = order.Description ?? "Payment description",
                        amount = new {
                            currency_code = order.Currency ?? "USD",
                            value = order.Amount.ToString("F2"),
                            // breakdown = new {
                            //     item_total = new {
                            //         currency_code = order.Currency ?? "USD",
                            //         value = order.Amount.ToString("F2")
                            //     }
                            // }
                        },
                        // items = new[]
                        // {
                        //     new {
                        //         name = order.Description ?? "Subscription",
                        //         description = "Payment for selected plan",
                        //         quantity = "1",
                        //         unit_amount = new {
                        //             currency_code = order.Currency ?? "USD",
                        //             value = order.Amount.ToString("F2")
                        //         }
                        //     }
                        // }
                    }
                },
                application_context = new
                {
                    brand_name = "realtime_platform",
                    landing_page = "LOGIN",
                    user_action = "PAY_NOW",
                    return_url = order.ReturnUrl,
                    cancel_url = order.CancelUrl
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
                Amount = request.BillingPeriod == "monthly" ? request.Amount : request.Amount * 12 * 0.95m,
                Currency = "USD",
                Gateway = "Paypal",
                GatewayRef = request.OrderId,
                Status = "Paid",
                Description = request.Description,
                ExpiredAt = request.BillingPeriod == "monthly" ? expiredAt.AddMonths(1) : expiredAt.AddYears(1)
            };

            await _paymentsService.SavePaypalPayment(paypal);

            string message = request.Name.ToLower() ==
                "free"
                    ? "You’re currently using the Free Plan."
                    : $"Thank you for upgrading to the {request.Name} Plan! Your payment has been successfully processed.";
                    
            return Ok(new { captureResponse = captureResponse, message = message });

        }
    }
}