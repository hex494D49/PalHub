
using PalHub.Api.DTOs;
using PalHub.Domain.Models;

namespace PalHub.Api.Extensions
{
    public static class UserExtensions
    {
        public static UserDto MapToUserDto(this User user)
        {
            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? string.Empty,
                DateAdded = user.DateAdded,
                LastModified = user.LastModified

                // Left here as a reminder that this part should be reconsidered
                //
                //DateAdded = user.DateAdded.ToString("yyyy-MM-dd HH:mm"),
                //LastModified = user.LastModified?.ToString("yyyy-MM-dd HH:mm") ?? string.Empty
            };
        }
    }
}