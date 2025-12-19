import { Revenue } from "@/utils/IPlan"
import { Calendar } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const RevenueChart = ({
    data,
    selectedMonth,
    onMonthChange
}: {
    data: Revenue[]
    selectedMonth: string
    onMonthChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
    const hasData = data && data.length > 0

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Revenue Analytics
                </h3>

                <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-1.5">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={onMonthChange}
                        className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer font-medium"
                    />
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                {!hasData ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        No revenue data for this month
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                dy={10}
                                tickFormatter={(day) => `Day ${day}`}
                                interval="preserveStartEnd"
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                            />

                            <CartesianGrid
                                vertical={false}
                                stroke="#F3F4F6"
                                strokeDasharray="3 3"
                            />

                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                labelFormatter={(day) => `Day ${day}`}
                                formatter={(
                                    value,
                                    _name,
                                    props
                                ) => {
                                    if (typeof value !== 'number') return null

                                    const payload = props?.payload as Revenue | undefined
                                    const tx = payload?.transactionCount ?? 0

                                    return [
                                        `$${value.toLocaleString()}`,
                                        `Revenue (${tx} tx)`
                                    ]
                                }}
                            />


                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#4F46E5"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                activeDot={{ r: 6 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}

export default RevenueChart
