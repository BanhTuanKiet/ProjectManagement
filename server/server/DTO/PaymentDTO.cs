namespace server.DTO
{
    public class PaymentDTO
    {
        public class PaymentDetail
        {
            public Guid Id { get; set; } = Guid.NewGuid();
            public decimal Amount { get; set; }
            public string Currency { get; set; } = "VND";  // "VND" hoặc "USD"
            public string Gateway { get; set; } = "VNPay"; // "VNPay" hoặc "PayPal"
            public string? GatewayRef { get; set; }         // Mã giao dịch từ VNPay/PayPal
            public string Status { get; set; } = "Pending"; // Pending | Paid | Failed
            public string? Description { get; set; }
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
            public UserDTO.PaymentUser User { get; set; }
        }

        public class PaymentQuery
        {
            public string? Search { get; set; }
            public string? Status { get; set; }
            public string? SortKey { get; set; }
            public string? SortDirection { get; set; }
        }

        public class Revenue
        {
            public int Day { get; set; }   
            public decimal Total { get; set; }  
            public int TransactionCount { get; set; }
        }
    }
}
