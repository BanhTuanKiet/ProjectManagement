export const shortenText = (value: string) => {
    if (value == null || value === '') return 'N/A'
    if (value.length > 15) {
        return value.substring(0, 15) + '...'
    }
    return value
}

export function capitalizeFirstLetter(text: string): string {
    if (!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatPrice(
    price: number | undefined | string,
    isVnd: boolean = true
) {
    if (!price) return "Free"

    const parsed = Number(price)

    if (isNaN(parsed)) return "Invalid price"

    if (isVnd) return parsed.toLocaleString("vi-VN") + " VND"

    return parsed.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    })
}
