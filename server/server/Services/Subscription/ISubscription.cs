using server.DTO;

namespace server.Models
{
    public interface ISubscriptions
    {
        Task<Subscriptions> AddSubscription(Subscriptions subscription);
        Task<Subscriptions> UpdateSubscription(Subscriptions subscription);
        Task<Subscriptions> FindSubcriptionByUserId(string userId);
    }
}
