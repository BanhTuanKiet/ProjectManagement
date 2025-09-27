using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace server.Util
{
    public class EmailUtils
    {
        public static async Task SendEmailAsync(IConfiguration _configuration, string toEmail, string subject, string message)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("Email không hợp lệ", nameof(toEmail));

            // Truy xuất các cài đặt từ configuration, với giá trị mặc định để tránh lỗi null
            string smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            string portStr = _configuration["EmailSettings:Port"] ?? "587";
            string enableSslStr = _configuration["EmailSettings:EnableSsl"] ?? "true";
            string senderEmail = _configuration["EmailSettings:SenderEmail"] ?? throw new InvalidOperationException("Email người gửi không được cấu hình");
            string password = _configuration["EmailSettings:Password"] ?? throw new InvalidOperationException("Mật khẩu email không được cấu hình");

            // Kiểm tra và chuyển đổi an toàn
            if (!int.TryParse(portStr, out int port))
                port = 587; // Giá trị mặc định nếu không thể parse

            if (!bool.TryParse(enableSslStr, out bool enableSsl))
                enableSsl = true; // Giá trị mặc định nếu không thể parse

            var smtpClient = new SmtpClient(smtpServer)
            {
                Port = port,
                EnableSsl = enableSsl,
                Credentials = new NetworkCredential(senderEmail, password)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, _configuration["EmailSettings:SenderName"] ?? "BookingCare"),
                Subject = subject,
                Body = message,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);

            try
            {
                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (SmtpException ex)
            {
                // Log chi tiết lỗi
                Console.WriteLine($"SMTP Error: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");

                throw new Exception($"Không thể gửi email: {ex.Message}", ex);
            }
        }
    }
}