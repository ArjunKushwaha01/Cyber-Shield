import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const PredictiveChart = ({ data }) => {
    // 1. Prepare Historical Data
    const historyData = data.map((d, index) => ({
        index: index,
        date: d.date.split(' ')[0], // Simplify date
        score: d.risk_score,
        type: 'History'
    }));

    // 2. Calculate Linear Regression (y = mx + b)
    const n = historyData.length;
    if (n < 2) return <div className="text-slate-500 text-center p-4">Need more data for prediction</div>;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    historyData.forEach(p => {
        sumX += p.index;
        sumY += p.score;
        sumXY += p.index * p.score;
        sumXX += p.index * p.index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 3. Generate Predictions (Next 5 points)
    const predictions = [];
    const lastIndex = historyData[n - 1].index;

    // Last actual point (to connect the lines)
    predictions.push({
        index: lastIndex,
        date: historyData[n - 1].date,
        predictedScore: historyData[n - 1].score,
        type: 'Prediction'
    });

    for (let i = 1; i <= 5; i++) {
        const nextIndex = lastIndex + i;
        let nextScore = slope * nextIndex + intercept;
        // Clamp score 0-100
        nextScore = Math.max(0, Math.min(100, nextScore));

        predictions.push({
            index: nextIndex,
            date: `+${i}d`, // Relative date for future
            predictedScore: Math.round(nextScore),
            type: 'Prediction'
        });
    }

    // Combine for Chart
    // We need a dataset where history has 'score' and prediction has 'predictedScore'
    const chartData = [
        ...historyData.map(d => ({ ...d, predictedScore: null })),
        ...predictions.slice(1) // Skip the connector point duplicates in mapping if handled by Recharts connectNulls? 
        // Actually, Recharts needs the data structure to perform the line connection.
    ];

    // Better approach for continuous line:
    // History points: { date, score: 50, predicted: null }
    // Future points: { date, score: null, predicted: 60 }
    // BUT to connect them, the transition point needs both? Or just use connectNulls.

    const combinedData = [
        ...historyData.map(d => ({ name: d.date, score: d.score, predicted: null })),
        ...predictions.slice(1).map(d => ({ name: d.date, score: null, predicted: d.predictedScore }))
    ];

    // Add connector point to "predicted" so it draws from the last real point
    // Actually, let's just use one array.

    // Re-calc specific structure for Recharts to handle two lines that visually join
    const finalData = [];
    historyData.forEach(h => {
        finalData.push({ name: h.date, score: h.score, predicted: null });
    });
    // Add the bridge point (last history point is also first prediction point conceptually)
    finalData[finalData.length - 1].predicted = finalData[finalData.length - 1].score;

    predictions.slice(1).forEach(p => {
        finalData.push({ name: p.date, score: null, predicted: p.predictedScore });
    });

    const isImproving = slope > 0;

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-indigo-400" /> Risk Forecast
                    </h3>
                    <p className="text-slate-400 text-sm">AI-driven projection based on recent scan history.</p>
                </div>
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${isImproving ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {isImproving ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    <span className="font-bold text-sm">
                        {isImproving ? "Risk Coverage Improving" : "Risk Score Declining"}
                    </span>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={finalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                            itemStyle={{ color: '#f1f5f9' }}
                        />
                        {/* History Line */}
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#38bdf8"
                            strokeWidth={3}
                            dot={{ fill: '#38bdf8', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Historical Score"
                            connectNulls
                        />
                        {/* Prediction Line */}
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="#a855f7"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ fill: '#a855f7', strokeWidth: 0, r: 4 }}
                            name="Predicted Trend"
                            connectNulls
                        />

                        {/* Future Zone Highlight */}
                        <ReferenceArea
                            x1={historyData[historyData.length - 1]?.date}
                            x2={finalData[finalData.length - 1]?.name}
                            strokeOpacity={0}
                            fill="#a855f7"
                            fillOpacity={0.05}
                        />

                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PredictiveChart;
