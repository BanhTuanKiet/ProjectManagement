using Microsoft.AspNetCore.Mvc;
using CloudinaryDotNet;
using server.Models;
using server.DTO;
using server.Configs;
using AutoMapper;

namespace server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlansController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;
        private readonly ProjectManagementContext _context;
        private readonly IPlans _planService;
        private readonly IMapper _mapper;
        public PlansController(Cloudinary cloudinary, ProjectManagementContext context, IPlans planService, IMapper mapper)
        {
            _cloudinary = cloudinary;
            _context = context;
            _planService = planService;
            _mapper = mapper;
        }

        [HttpGet()]
        public async Task<ActionResult> GetPlans()
        {
            var plans = await _planService.GetPlans();
            return Ok(plans);
        }
    }
}