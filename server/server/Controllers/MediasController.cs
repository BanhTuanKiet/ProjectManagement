using Microsoft.AspNetCore.Mvc;
using server.DTO;
using server.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using server.Configs;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class MediasController : ControllerBase
    {
        private readonly IMedia _mediaService;

        public MediasController(IMedia mediaService)
        {
            _mediaService = mediaService;
        }

        [HttpGet()]
        public async Task<ActionResult> GetMeidas()
        {
            List<MediaDTO.Media> medias = await _mediaService.GetMedias();
            return Ok(medias);
        }

        [HttpPut("contact")]
        public async Task<ActionResult> PutContacts([FromBody] List<MediaDTO.Contact> contacts)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<Contact> updatedContacts = await _mediaService.PutContacts(contacts, userId);
            if (updatedContacts.Count <= 0) throw new ErrorException(400, "Update failed");
            return Ok(new { message = "Update successful" });
        }
    }
}