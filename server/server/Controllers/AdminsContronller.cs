using Microsoft.AspNetCore.Mvc;
using server.Models;
using Microsoft.AspNetCore.Identity;
using server.Configs;
using server.DTO;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DocumentFormat.OpenXml.Drawing.Diagrams;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

namespace server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Authorize(Roles = "admin")]
    public class AdminsController : ControllerBase
    {
        private readonly IUsers _userServices;
        private readonly UserManager<ApplicationUser> _userManager;
        public readonly ProjectManagementContext _context;
        private readonly IPlans _planServices;
        private readonly IPayments _paymentService;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        public AdminsController(
            IUsers userServices,
            UserManager<ApplicationUser> userManager,
            ProjectManagementContext context,
            IPlans planServices,
            IPayments paymentServices,
            IConfiguration configuration,
            IMapper mapper)
        {
            _userServices = userServices;
            _userManager = userManager;
            _context = context;
            _planServices = planServices;
            _paymentService = paymentServices;
            _configuration = configuration;
            _mapper = mapper;
        }

        [HttpGet("users/{page}")]
        public async Task<ActionResult> GetUsers(int page, [FromQuery] UserDTO.UserQuery query)
        {
            const int pageSize = 10;
            int currentPage = page < 0 ? 0 : page;

            var users = await _userServices.GetUsersPaged(currentPage, query);

            if (users.Count() <= 0) return Ok();

            var totalUsers = await _userManager.Users.CountAsync();
            var totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize);

            return Ok(new
            {
                data = users,
                totalPages
            });
        }

        [HttpGet("plans")]
        public async Task<ActionResult> GetPlans([FromQuery] PlanDTO.PlanQuery query)
        {
            var plans = await _planServices.GetPlans();

            if (plans.Count() <= 0) return Ok();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.ToLower();

                var result = plans
                    .Where(p => p.Name.ToLower().Contains(search))
                    .ToList();

                // if (result.Count() <= 0)
                // {
                //     result = plans
                //         .Where(p => p.Features.Any(f =>
                //             f.FeatureName.ToLower().Contains(search)))
                //         .ToList();
                // }

                return Ok(result);
            }

            if (!string.IsNullOrEmpty(query.Direction) && query.Direction == "asc")
            {
                var result = plans.OrderBy(p => p.Name);
            }

            if (!string.IsNullOrEmpty(query.Direction) && query.Direction == "desc")
            {
                var result = plans.OrderByDescending(p => p.Name);
            }

            return Ok(plans);
        }

        [HttpPut("plans/{planId}")]
        public async Task<ActionResult> PutPlan(int planId, [FromBody] PlanDTO.EditPlan editedFields)
        {
            var plan = await _planServices.FindPlanById(planId)
                ?? throw new ErrorException(404, "Plan not found");

            var editedPlan = await _planServices.PutPlan(plan, editedFields);

            var mappedPlan = _mapper.Map<PlanDTO.PlanDetail>(editedPlan);

            return Ok(new
            {
                message = "Plan updated successfully",
                data = mappedPlan
            });
        }

        [HttpGet("payments/{page}")]
        public async Task<ActionResult> GetPayments(int page, [FromQuery] PaymentDTO.PaymentQuery query)
        {
            const int pageSize = 10;
            int currentPage = page < 0 ? 0 : page;

            var payments = await _paymentService.GetPayments();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.ToLower();
                payments = payments.Where(p =>
                    p.Id.ToString().Contains(search) ||
                    p.User.UserName.ToLower().Contains(search) ||
                    p.GatewayRef.ToLower().Contains(search)
                ).ToList();
            }

            if (!string.IsNullOrEmpty(query.Status) && query.Status != "all")
            {
                var status = query.Status.ToLower();
                payments = payments.Where(p => p.Status.ToLower() == status).ToList();
            }

            if (!string.IsNullOrEmpty(query.SortKey) && !string.IsNullOrEmpty(query.SortDirection))
            {
                bool asc = query.SortDirection == "asc";
                payments = query.SortKey switch
                {
                    "amount" => asc
                        ? payments.OrderBy(p => p.Amount).ToList()
                        : payments.OrderByDescending(p => p.Amount).ToList(),

                    "createdAt" => asc
                        ? payments.OrderBy(p => p.CreatedAt).ToList()
                        : payments.OrderByDescending(p => p.CreatedAt).ToList(),

                    _ => payments
                };
            }

            var totalPayments = payments.Count;
            var totalPages = (int)Math.Ceiling(totalPayments / (double)pageSize);

            payments = payments
                .Skip(currentPage * pageSize)
                .Take(pageSize)
                .ToList();

            var mappedPayemnts = _mapper.Map<List<PaymentDTO.PaymentDetail>>(payments);

            return Ok(new
            {
                data = payments,
                totalPages
            });
        }

        [HttpPut("users/{userId}/toggle-active")]
        public async Task<ActionResult> ToggleUserActive(string userId)
        {
            var user = await _userServices.FindUserById(userId)
                ?? throw new ErrorException(404, "User not found");

            bool previousState = user.IsActive;
            var toggledActiveUser = await _userServices.ToggleActive(user);

            if (toggledActiveUser.IsActive == previousState)
                throw new ErrorException(400, "Failed to toggle user status");

            return Ok(new
            {
                message = user.IsActive
                    ? "User account has been activated"
                    : "User account has been deactivated",
            });
        }

        [HttpPut("plans/{planId}/toggle-active")]
        public async Task<ActionResult> TogglePlanActive(int planId)
        {
            var plan = await _planServices.FindPlanById(planId)
                ?? throw new ErrorException(404, "Plan not found");

            bool previousState = plan.IsActive;
            var toggledActiveUPlan = await _planServices.ToggleActive(plan);

            if (toggledActiveUPlan.IsActive == previousState)
                throw new ErrorException(400, "Failed to toggle plan status");

            return Ok(new
            {
                message = plan.IsActive
                    ? "This plan has been activated"
                    : "This plan has been deactivated",
            });
        }

        [HttpGet("payments/revenue/{month}/{year}")]
        public async Task<ActionResult> GetRevenue(int month, int year)
        {
            var revenue = await _paymentService.GetRevenue(month, year);

            if (revenue.Count() <= 0) return Ok();
            return Ok(revenue);
        }
    }
}