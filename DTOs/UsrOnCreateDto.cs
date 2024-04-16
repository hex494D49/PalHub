using PalHub.Api.Attributes;
using PalHub.Api.Validation;
using PalHub.Application.Services;
using System.ComponentModel.DataAnnotations;

namespace PalHub.Api.DTOs
{
    public class UserOnCreateDto
    {

        [Required(ErrorMessageResourceName = "FirstNameRequired", ErrorMessageResourceType = typeof(Resources.UserController_hr))]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessageResourceName = "LastNameRequired", ErrorMessageResourceType = typeof(Resources.UserController_hr))]
        public string LastName { get; set; } = string.Empty;

        [CustomEmailAddress(ErrorMessageResourceName = "InvalidEmailFormat", ErrorMessageResourceType = typeof(Resources.UserController_hr))]
        public string Email { get; set; } = string.Empty;

    }

}
