using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;
using server.Util;
using server.Configs;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace server.Services.Project
{
    public class SubscriptionServices : ISubscriptions
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public SubscriptionServices(ProjectManagementContext context, IMapper mapper, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<Subscriptions> AddSubscription(Subscriptions subscriptions)
        {
            var entry = await _context.Subscriptions.AddAsync(subscriptions);
            await _context.SaveChangesAsync();
            return entry.Entity;
        }

        public async Task<Subscriptions> UpdateSubscription(Subscriptions subscription)
        {
            var sub = await _context.Subscriptions.FirstOrDefaultAsync(s => s.Id == subscription.Id);
            
            sub.PlanId = subscription.PlanId;
            sub.StartedAt = subscription.StartedAt;
            sub.ExpiredAt = subscription.ExpiredAt;
            sub.PaymentId = subscription.PaymentId;

            await _context.SaveChangesAsync();
            return subscription;
        }

        public async Task<Subscriptions> FindSubcriptionByUserId(string userId)
        {
            return await _context.Subscriptions.FirstOrDefaultAsync(sub => sub.UserId == userId);
        }
    }
}

