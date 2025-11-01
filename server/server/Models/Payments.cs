using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class Payments
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string UserId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(3)]
        public string Currency { get; set; } = "VND";  // "VND" hoặc "USD"

        [Required]
        [StringLength(20)]
        public string Gateway { get; set; } = "VNPay"; // "VNPay" hoặc "PayPal"

        [StringLength(100)]
        public string? GatewayRef { get; set; }         // Mã giao dịch từ VNPay/PayPal

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // Pending | Paid | Failed

        [StringLength(255)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(UserId))]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}
