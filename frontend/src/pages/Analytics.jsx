import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import PredictiveChart from '../components/dashboard/PredictiveChart';
import { API_BASE_URL } from '../config';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/analytics`);
                const data = await res.json();
                setAnalytics(data);
            } catch (err) {
                console.error("Error loading analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="text-white">Loading Analytics...</div>;
    if (!analytics) return <div className="text-white">No data available.</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Predictive Analytics</h2>
                <p className="text-slate-400">AI-driven insights and future risk forecasting.</p>
            </header>

            <div className="h-[500px]">
                <PredictiveChart data={analytics.trends} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Our predictive engine uses <strong>Linear Regression</strong> on your historical scan data to calculate the "Line of Best Fit".
                        It analyzes the slope of your risk score changes over time to project your security posture for the next 5 intervals.
                    </p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">Risk Factors</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-sky-400 rounded-full" /> Frequency of high-severity vulnerabilities</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-sky-400 rounded-full" /> Rate of remediation (Fix velocity)</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-sky-400 rounded-full" /> Appearance of new vulnerability classes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
