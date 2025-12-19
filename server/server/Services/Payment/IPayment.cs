using server.DTO;

namespace server.Models
{
    public interface IPayments
    {
        Task<Payments> SavePaypalPayment(Payments paypalPayment);
        Task<decimal> GetLatestFxRates(HttpClient httpClient, string rate);
        Task<List<Payments>> GetPayments();
        Task<List<PaymentDTO.Revenue>> GetRevenue(int month, int year);
    }
}
