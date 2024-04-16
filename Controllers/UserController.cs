using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using PalHub.Api.DTOs;
using PalHub.Api.Exceptions;
using PalHub.Api.Extensions;
using PalHub.Application.Services;
using PalHub.Domain.Hekpers;
using PalHub.Domain.Models;

namespace PalHub.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly IStringLocalizer<UserController> _localizer;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService userService, IConfiguration configuration, IStringLocalizer<UserController> localizer, ILogger<UserController> logger)
        {
            _userService = userService;
            _configuration = configuration;
            _localizer = localizer;
            _logger = logger;

        }

        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers([FromQuery] QueryParams searchParams)
        {
            (var users, var count) = await _userService.GetAllUsersAsync(searchParams);

            var result = new
            {
                endpoint = "api/users",
                columns = typeof(UserDto).GetModelColumns(),
                data = users.Select(user => user.MapToUserDto()).ToList(),
                pager = new
                {
                    totalCount = count,
                    pageSize = searchParams.PageSize,
                    currentPage = searchParams.PageNumber
                }
            };

            return Ok(result);
        }

        [HttpGet]
        [Route("{id:int}")]
        public async Task<ActionResult<UserDto>> GetUserById([FromRoute] int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return user != null ? Ok(user.MapToUserDto()) : NotFound(new { message = _localizer["RecordNotFound"].Value });
        }

        /*
        [HttpPost]
        public async Task<ActionResult<UserDto>> AddUser([FromBody] UserOnCreateDto userDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new User
            {
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                Email = userDto.Email.Length == 0 ? null : userDto.Email  
            };

            var id = await _userService.InsertUserAsync(user);
            if (id == 0)
            {
                // Assuming an ID of 0 indicates failure to insert for some reason.
                return BadRequest(new { message = _localizer["UnableToAddRecord"].Value });
            }

            user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                // This situation should theoretically never happen but is here as a safety check.
                return BadRequest(new { message = _localizer["RecordCreatedButNotRetrieved"].Value });
            }

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user.MapToUserDto());
        }
        */

        [HttpPost]
        public async Task<ActionResult<UserDto>> AddUser([FromBody] UserOnCreateDto userDto)
        {
            //throw new NotImplementedException();

            bool modelStateInvalid = !ModelState.IsValid;

            bool emailExists = await _userService.EmailExistsAsync(userDto.Email);
            if (emailExists)
            {
                ModelState.AddModelError("Email", "Email already exists.");
            }

            if (modelStateInvalid || emailExists)
            {
                var errorsToSend = ModelState.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                );
                return BadRequest(new { errors = errorsToSend });
            }

            var user = new User
            {
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                Email = userDto.Email.Length == 0 ? null : userDto.Email
            };

            try
            {
                var id = await _userService.InsertUserAsync(user);

                var createdUser = await _userService.GetUserByIdAsync(id);
                if (createdUser == null)
                {
                    return BadRequest(new { message = _localizer["RecordCreatedButNotRetrieved"].Value });
                }

                var userDtoResult = createdUser.MapToUserDto(); // Adjust this line according to your actual mapping mechanism

                return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, userDtoResult);
            }
            catch (Exception ex)
            {
                _logger.LogError($"An unexpected error occurred: {ex.Message}", ex);
                return StatusCode(500, new { message = _localizer["UnexpectedError"].Value });
            }
        }


        [HttpPut]
        [Route("{id:int}")]
        public async Task<ActionResult<UserDto>> UpdateUser([FromRoute] int id, [FromBody] UserOnUpdateDto userDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // An attempt to verify the id in the route matches the id in the DTO; myabe only one source should be using
            var userToUpdate = new User
            {
                Id = id,
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                Email = userDto.Email.Length == 0 ? null : userDto.Email,
            };

            var rowsAffected = await _userService.UpdateUserAsync(userToUpdate);
            if (rowsAffected == 0)
            {
                // In case the user was not found or not updated
                return NotFound(new { message = string.Format(_localizer["RecordWithIdNotFound"], id) });
            }

            var updatedUser = await _userService.GetUserByIdAsync(id);
            if (updatedUser == null)
            {
                // Just a safety check, this should not typically occur if rows were affected
                return NotFound();
            }

            return Ok(updatedUser.MapToUserDto());
        }


        [HttpDelete]
        [Route("{id:int}")]
        public async Task<IActionResult> DeleteUser([FromRoute] int id)
        {
            var success = await _userService.DeleteUserAsync(id);

            if (!success)
            {
                return NotFound(new { message = _localizer["RecordNotFound"].Value });
            }

            return NoContent();
        }

        private ActionResult HandleModelError()
        {
            var errors = ModelState
                .Where(e => e.Value.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                );

            // Assuming you're using a specific structure for errors, like:
            // { errors: { fieldName: ["Error message 1", "Error message 2"], ... } }
            var errorResponse = new { errors = errors };
            return BadRequest(errorResponse);
        }



    }
}
