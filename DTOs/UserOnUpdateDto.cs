using PalHub.Api.Validation;
using System.ComponentModel.DataAnnotations;
using System.Resources;

namespace PalHub.Api.DTOs
{
    public class UserOnUpdateDto
    {
        [Required(ErrorMessageResourceName = "IdIsRquired", ErrorMessageResourceType = typeof(Resources.UserController_hr))]
        public int Id { get; set; }

        [Required(ErrorMessageResourceName = "FirstNameRequired", ErrorMessageResourceType = typeof(Resources.UserController_hr))]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessageResourceName = "LastNameRequired", ErrorMessageResourceType = typeof(Resources.UserController_hr))]
        public string LastName { get; set; } = string.Empty;

        [CustomEmailAddress(ErrorMessageResourceName = "InvalidEmailFormat", ErrorMessageResourceType = typeof(Resources.UserController_hr))]
        public string Email { get; set; } = string.Empty;

    }
}
