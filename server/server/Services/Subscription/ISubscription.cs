using server.DTO;

namespace server.Models
{
    public interface ISubscriptions
    {
        Task<Subscriptions> AddSubscription(Subscriptions subscriptions);
    }
}
