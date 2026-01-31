import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RiskTrendChart = ({ data }) => {
    // Ensure we have at least 2 points to render a "wave" / area
    const chartData = data && data.length === 1
        ? [
            { date: 'Initial', risk_score: data[0].risk_score }, // Start flat to show steady state, or 0/50 for effect. Let's match current for a "steady" look or 0 for "rise".
            ...data
        ]
        : data;

    // If completely empty, show placeholder
    const finalData = (!chartData || chartData.length === 0)
        ? [{ date: 'Start', risk_score: 0 }, { date: 'Now', risk_score: 0 }]
        : chartData;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        padding={{ left: 0, right: 0 }}
                        tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                        domain={[0, 100]}
                        tick={{ fill: '#94a3b8' }}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="risk_score"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRisk)"
                        // Removed distinct dots to restore "wave" look, unless user hovers
                        activeDot={{ r: 6, fill: "#38bdf8", stroke: "#0f172a", strokeWidth: 3 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RiskTrendChart;
