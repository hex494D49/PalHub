using System.ComponentModel.DataAnnotations;
using System.Globalization;
using PalHub.Api.Resources;

namespace PalHub.Api.Validation
{
    public class CustomEmailAddressAttribute : ValidationAttribute
    {
        public CustomEmailAddressAttribute()
        {
            ErrorMessageResourceName = "InvalidEmailFormat";
            ErrorMessageResourceType = typeof(UserController_hr);
        }

        protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
        {
            var email = value as string;
            if (string.IsNullOrWhiteSpace(email))
            {
                return ValidationResult.Success;
            }

            if (new EmailAddressAttribute().IsValid(email))
            {
                return ValidationResult.Success;
            }

            string errorMessage = FormatErrorMessage(validationContext.DisplayName);
            return new ValidationResult(errorMessage);
        }
    }
}
