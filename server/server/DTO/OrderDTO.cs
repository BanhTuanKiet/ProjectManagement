namespace server.DTO
{
    public class OrderDTO
    {
        public class PaypalOrder
        {
            public int PlanId { get; set; }
            public decimal Amount { get; set; }
            public string Currency { get; set; } = "USD";
            public string Name { get; set; }
            public string BillingPeriod { get; set; }
            public string ReturnUrl { get; set; }
            public string CancelUrl { get; set; }
        }

        public class PaypalCaptureRequest
        {
            public int PlanId { get; set; }
            public string OrderId { get; set; }
            public decimal Amount { get; set; }
            public string Name { get; set; }
            public string BillingPeriod { get; set; }
        }
    }
}
