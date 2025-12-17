using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class Features
    {
        [Key]
        public int FeatureId { get; set; }
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        // Navigation property
        public ICollection<PlanFeatures> PlanFeatures { get; set; } = new List<PlanFeatures>();
    }
}
