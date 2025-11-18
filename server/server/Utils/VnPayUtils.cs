using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using server.DTO;
using server.Configs;

namespace server.Util
{
    public class VnPayUtil
    {
        private readonly SortedList<string, string> _requestData = new(new VnPayCompare());
        private readonly SortedList<string, string> _responseData = new(new VnPayCompare());

        public OrderDTO.VnPayPaymentCallBack GetFullResponseData(IQueryCollection collection, string hashSecret)
        {
            foreach (var (key, value) in collection)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_", StringComparison.OrdinalIgnoreCase) || key == "planId" || key == "billingPeriod")
                {
                    AddResponseData(key, value);
                    Console.WriteLine($"Response Data - Key: {key}, Value: {value}");
                }
            }


            var orderId = GetResponseData("vnp_TxnRef");
            var vnPayTranId = GetResponseData("vnp_TransactionStatus");
            var vnpResponseCode = GetResponseData("vnp_ResponseCode");
            var vnpSecureHash = collection.FirstOrDefault(k => k.Key == "vnp_SecureHash").Value;
            var orderInfo = GetResponseData("vnp_OrderInfo");
            var paymentDateTime = GetResponseData("vnp_PayDate");
            var amount = GetResponseData("vnp_Amount");
            var vnPayTranNo = GetResponseData("vnp_TransactionNo");
            DateTime payDate = DateTime.ParseExact(paymentDateTime, "yyyyMMddHHmmss", null);
            var planId = GetResponseData("planId");
            var billingPeriod = GetResponseData("billingPeriod");

            var isValid = ValidateSignature(vnpSecureHash, hashSecret);

            if (amount.Length >= 2)
            {
                amount = amount.Substring(0, amount.Length - 2);
            }
            if (long.TryParse(amount, out long parsedAmount))
            {
                amount = parsedAmount.ToString("N0", System.Globalization.CultureInfo.InvariantCulture);
            }
            else
            {
                throw new ErrorException(400, "Giá trị tiền không hợp lệ");
            }

            return new OrderDTO.VnPayPaymentCallBack
            {
                PaymentInfo = orderInfo,
                PaymentId = orderId,
                TransactionCode = vnPayTranId,
                PaymentDateTime = payDate,
                VnPayResponseCode = vnpResponseCode,
                TransactionNo = vnPayTranNo,
                Amount = amount,
                PlanId = planId,
                BillingPeriod = billingPeriod
            };
        }

        public string GetIpAddress(HttpContext context)
        {
            try
            {
                var remoteIpAddress = context.Connection.RemoteIpAddress;

                if (remoteIpAddress is not null)
                {
                    if (remoteIpAddress.AddressFamily == AddressFamily.InterNetworkV6)
                    {
                        remoteIpAddress = remoteIpAddress.MapToIPv4();
                    }

                    return remoteIpAddress.ToString();
                }
            }
            catch
            {

            }

            return "127.0.0.1";
        }

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData[key] = value;
            }
        }

        public void AddResponseData(string key, string value)
        {
            _responseData[key] = value ?? "";
        }

        public string GetResponseData(string key)
        {
            return _responseData.TryGetValue(key, out var value) ? value : string.Empty;
        }

        public string CreateRequestUrl(string baseUrl, string vnpHashSecret)
        {
            var sortedData = _requestData
                            .Where(kv => !string.IsNullOrEmpty(kv.Value))
                            .OrderBy(kv => kv.Key)
                            .ToList();

            var data = new StringBuilder();

            foreach (var (key, value) in sortedData)
            {
                data.Append($"{WebUtility.UrlEncode(key)}={WebUtility.UrlEncode(value)}&");
            }

            var queryString = data.ToString().TrimEnd('&');
            var signData = queryString;

            var vnpSecureHash = HmacSha512(vnpHashSecret, signData);

            var fullUrl = $"{baseUrl}?{queryString}&vnp_SecureHash={vnpSecureHash}";

            return fullUrl;
        }


        public bool ValidateSignature(string inputHash, string secretKey)
        {
            var rawData = GetRawResponseData();
            var myChecksum = HmacSha512(secretKey, rawData);

            return myChecksum.Equals(inputHash, StringComparison.OrdinalIgnoreCase);
        }

        private string HmacSha512(string key, string inputData)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);

            using var hmac = new HMACSHA512(keyBytes);
            var hashBytes = hmac.ComputeHash(inputBytes);

            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }

        private string GetRawResponseData()
        {
            var data = new StringBuilder();

            var filteredData = _responseData
                .Where(kv => kv.Key != "vnp_SecureHashType" && kv.Key != "vnp_SecureHash")
                .Where(kv => !string.IsNullOrEmpty(kv.Value));

            foreach (var (key, value) in filteredData)
            {
                data.Append($"{WebUtility.UrlEncode(key)}={WebUtility.UrlEncode(value)}&");
            }

            return data.ToString().TrimEnd('&');
        }
    }

    public class VnPayCompare : IComparer<string>
    {
        public int Compare(string x, string y)
        {
            return string.Compare(x, y, CultureInfo.InvariantCulture, CompareOptions.Ordinal);
        }
    }
}
