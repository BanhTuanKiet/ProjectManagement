import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"

const pricingPlans = [
  {
    name: "Free",
    price: "0đ",
    period: "/tháng",
    description: "Hoàn hảo để bắt đầu",
    features: ["5 dự án", "1GB lưu trữ", "Hỗ trợ email cơ bản", "Truy cập các tính năng cơ bản", "Cộng đồng hỗ trợ"],
    buttonText: "Bắt đầu miễn phí",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Standard",
    price: "299,000đ",
    period: "/tháng",
    description: "Tốt nhất cho các nhóm nhỏ",
    features: [
      "50 dự án",
      "100GB lưu trữ",
      "Hỗ trợ ưu tiên 24/7",
      "Tính năng nâng cao",
      "Phân tích chi tiết",
      "Tích hợp API",
      "Sao lưu tự động",
    ],
    buttonText: "Chọn Standard",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Premium",
    price: "599,000đ",
    period: "/tháng",
    description: "Cho doanh nghiệp lớn",
    features: [
      "Dự án không giới hạn",
      "1TB lưu trữ",
      "Hỗ trợ chuyên dụng",
      "Tất cả tính năng Premium",
      "Báo cáo tùy chỉnh",
      "Tích hợp nâng cao",
      "Bảo mật cấp doanh nghiệp",
      "Đào tạo và tư vấn",
    ],
    buttonText: "Chọn Premium",
    buttonVariant: "default" as const,
    popular: false,
  },
]

export default function PricingCards() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">Chọn gói phù hợp với bạn</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Từ cá nhân đến doanh nghiệp, chúng tôi có gói dịch vụ phù hợp với mọi nhu cầu của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <Card
            key={plan.name}
            className={`relative transition-all duration-300 hover:shadow-lg ${
              plan.popular
                ? "border-blue-500 shadow-lg scale-105 bg-gradient-to-br from-blue-50 to-blue-100/50"
                : plan.name === "Premium"
                  ? "border-purple-700 hover:border-purple-600 bg-gradient-to-br from-purple-50 to-purple-100/50"
                  : "border-border hover:border-primary/50"
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1">
                <Star className="w-3 h-3 mr-1" />
                Phổ biến nhất
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-card-foreground">{plan.name}</CardTitle>
              <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
              <div className="mt-4">
                <span
                  className={`text-4xl font-bold ${
                    plan.name === "Premium"
                      ? "text-purple-700"
                      : plan.name === "Standard"
                        ? "text-blue-600"
                        : "text-primary"
                  }`}
                >
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent className="pb-6">
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.name === "Premium"
                          ? "text-purple-700"
                          : plan.name === "Standard"
                            ? "text-blue-600"
                            : "text-primary"
                      }`}
                    />
                    <span className="text-card-foreground text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                variant={plan.buttonVariant}
                className={`w-full font-medium ${
                  plan.name === "Premium"
                    ? "bg-purple-700 hover:bg-purple-800 text-white"
                    : plan.name === "Standard"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : ""
                }`}
                size="lg"
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground text-sm">
          Tất cả gói đều bao gồm bảo mật SSL và sao lưu hàng ngày.
          <br />
          Có thể hủy bất cứ lúc nào. Không có phí ẩn.
        </p>
      </div>
    </div>
  )
}
