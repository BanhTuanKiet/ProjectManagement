using Microsoft.AspNetCore.Mvc;
using CloudinaryDotNet;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlansController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;
        private readonly ProjectManagementContext _context;
        private readonly IPlans _planService;

        public PlansController(Cloudinary cloudinary, ProjectManagementContext context, IPlans planService)
        {
            _cloudinary = cloudinary;
            _context = context;
            _planService = planService;
        }

        [HttpGet()]
        public async Task<ActionResult> GetPlans()
        {
            var plans = await _planService.GetPlans();
            return Ok(plans);
        }
    }
}