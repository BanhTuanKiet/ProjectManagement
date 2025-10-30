namespace server.DTO
{
    public class OrderDTO
    {
        public class PaypalOrder
        {
            public decimal Amount { get; set; }
            public string Currency { get; set; } = "USD";
            // public string PlanId { get; set; }
            public string Description { get; set; }
            public string ReturnUrl { get; set; }
            public string CancelUrl { get; set; }
        }

        public class PaypalCaptureRequest
        {
            public string OrderId { get; set; }
            public decimal Amount { get; set; }
            public string Description { get; set; }
            public string Name { get; set; }
            public string BillingPeriod { get; set; }
        }
    }
}
