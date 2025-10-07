using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class ProjectInvitations
    {
        public int Id { get; set; }

        public int ProjectId { get; set; }

        public string Email { get; set; }

        public string RoleInProject { get; set; }

        public Guid Token { get; set; }

        public bool? IsAccepted { get; set; } = false;

        public DateTime InvitedAt { get; set; }
    }
}
