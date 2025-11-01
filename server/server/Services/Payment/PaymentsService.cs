using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;

namespace server.Services.Project
{
    public class PaymentsService : IPayments
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public PaymentsService(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Payments> SavePaypalPayment(Payments paypalPayment)
        {
            await _context.Payments.AddAsync(paypalPayment);
            await _context.SaveChangesAsync();
            return paypalPayment;
        }
    }
}
