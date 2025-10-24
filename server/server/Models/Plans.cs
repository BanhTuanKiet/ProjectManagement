using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class Plans
    {
        [Key]
        public int PlanId { get; set; }

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Price { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        public bool Badge { get; set; } = false;

        public bool IsActive { get; set; } = true;

        // Navigation property
        public ICollection<PlanFeatures> PlanFeatures { get; set; } = new List<PlanFeatures>();
    }
}
