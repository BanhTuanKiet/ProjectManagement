using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class PlanFeatures
    {
        [Key]
        public int PlanFeatureId { get; set; }
        [Required]
        public int PlanId { get; set; }
        [Required]
        public int FeatureId { get; set; }
        [Required, MaxLength(20)]
        public string ValueType { get; set; } = string.Empty;  // 'boolean' | 'string'
        [Required, MaxLength(100)]
        public string Value { get; set; } = string.Empty;       // e.g., 'true', 'Unlimited', '1GB'
        // Navigation properties
        [ForeignKey(nameof(PlanId))]
        public Plans? Plans { get; set; }
        [ForeignKey(nameof(FeatureId))]
        public Features? Features { get; set; }
    }
}
