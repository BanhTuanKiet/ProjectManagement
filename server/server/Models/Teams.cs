using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using server.Models;

namespace YourNamespace.Models
{
    public class Teams
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(256)]
        public string Name { get; set; } = null!;

        // Leader liên kết với AspNetUsers
        [Required]
        [ForeignKey("Leader")]
        public string LeaderId { get; set; } = null!;

        public virtual ApplicationUser Leader { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Danh sách member
        public ICollection<TeamMembers> Members { get; set; } = new List<TeamMembers>();
    }

    public class TeamMembers
    {
        public Guid TeamId { get; set; }
        public Teams Team { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public virtual ApplicationUser User { get; set; } = null!;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
