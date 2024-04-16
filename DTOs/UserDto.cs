using Microsoft.AspNetCore.Components.Forms;
using PalHub.Api.Attributes;
using PalHub.Api.Validation;
using System.ComponentModel.DataAnnotations;

namespace PalHub.Api.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }

        [Searchable]
        [Sortable]
        public string FirstName { get; set; } = string.Empty;

        [Searchable]
        [Sortable]
        public string LastName { get; set; } = string.Empty;

        [Sortable]
        public string Email { get; set; } = string.Empty;

        [Sortable]
        public DateTime DateAdded { get; set; }

        [Sortable]
        public DateTime? LastModified { get; set; }

    }
}
