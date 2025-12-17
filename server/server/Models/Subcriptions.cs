using System.ComponentModel.DataAnnotations;
using server.Models;

public class Subscriptions
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string UserId { get; set; }
    public int PlanId { get; set; }
    public Guid? PaymentId { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiredAt { get; set; }

    public virtual ApplicationUser User { get; set; }
    public virtual Plans Plan { get; set; }
    public virtual Payments? Payment { get; set; }
}
