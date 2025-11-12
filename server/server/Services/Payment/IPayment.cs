using server.DTO;

namespace server.Models
{
    public interface IPayments
    {
        Task<Payments> SavePaypalPayment(Payments paypalPayment);
        Task<decimal> GetLatestFxRates(HttpClient httpClient, string rate);
    }
}
