using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services.Backlog;
using server.Models;
using server.Configs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Net.Http.Headers;
using System.Text.Json;

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
                        amount = new {
                            currency_code = order.Currency ?? "USD",
                            value = order.Amount.ToString("F2")
                        }
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
            using var doc = JsonDocument.Parse(result);
            var links = doc.RootElement.GetProperty("links").EnumerateArray();
            var approve = links.FirstOrDefault(l =>
                l.TryGetProperty("rel", out var relProp) && relProp.GetString() == "approve");

            if (approve.ValueKind == JsonValueKind.Undefined)
            {
                throw new ErrorException(400, "Payment failed");
            }

            var approveLink = approve.GetProperty("href").GetString();
            return Ok(result);
        }

        [HttpPost("capture-order")]
        public async Task<IActionResult> CaptureOrder([FromBody] OrderDTO.PaypalCaptureRequest request)
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

            var captureUrl = $"{baseUrl}/v2/checkout/orders/{request.OrderId}/capture";
            var captureResponse = await _httpClient.PostAsJsonAsync(captureUrl, new { });
            var captureResult = await captureResponse.Content.ReadAsStringAsync();

            return Content(captureResult, "application/json");
        }
    }
}