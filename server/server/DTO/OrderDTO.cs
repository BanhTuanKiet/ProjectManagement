namespace server.DTO
{
    public class OrderDTO
    {
        public class PaypalOrder
        {
            public decimal Amount { get; set; }
            public string Currency = "USD";
            public string ReturnUrl { get; set; }
            public string CancelUrl { get; set; }
        }

        public class PaypalCaptureRequest
        {
             public string OrderId { get; set; }
        }
    }
}
