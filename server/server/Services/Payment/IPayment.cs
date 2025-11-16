using server.DTO;

namespace server.Models
{
    public interface IPayments
    {
        Task<Payments> SavePaypalPayment(Payments paypalPayment);
        Task<decimal> GetLatestFxRates(HttpClient httpClient, string rate);
        Task<string> CreatePaymentUrl(HttpContext context, decimal amount, string orderId, string orderType, string orderDescription, string name, OrderDTO.PaypalOrder order);
        OrderDTO.VnPayPaymentCallBack PaymentExecute(IQueryCollection collections);
    }
}
