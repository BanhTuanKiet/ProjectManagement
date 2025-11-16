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

        public class VnPayPaymentCallBack
        {
            public string VnPayResponseCode { get; set; }
            public string PaymentInfo { get; set; }
            public string PlanId { get; set; }
            public string PaymentId { get; set; }
            public DateTime PaymentDateTime { get; set; }
            public string TransactionCode { get; set; }
            public string TransactionNo { get; set; }
            public string Amount { get; set; }
            public string BillingPeriod { get; set; }

        }

        public class PaymentInformationModel
        {
            public string PaymentId { get; set; }
            public string Amount { get; set; }
            public string OrderDescription { get; set; }
            public string Name { get; set; }
            public DateTime Date { get; set; }
            public string Success { get; set; }
        }
    }
}
