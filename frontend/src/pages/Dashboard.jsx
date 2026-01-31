import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Zap, CheckCircle, XCircle, ArrowRight, TrendingUp, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import RiskTrendChart from '../components/dashboard/RiskTrendChart';
import HoloCube from '../components/visuals/HoloCube';
import LiveTerminal from '../components/dashboard/LiveTerminal';

import { API_BASE_URL } from '../config';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl hover:border-sky-500/30 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-slate-900/50 ${color.replace('text-', 'bg-')}/10 group-hover:scale-110 transition-transform`}>
                <Icon size={24} className={color} />
            </div>
            {trend && <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.includes('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{trend}</span>}
        </div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">{value}</p>
    </div>
);

const Dashboard = () => {
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

    if (loading) return <div className="text-white">Loading Dashboard...</div>;
    if (!analytics) return <div className="text-white">No data available. Run a scan first.</div>;

    const totalScans = analytics.trends.length;
    const avgRisk = analytics.trends.length > 0
        ? Math.round(analytics.trends.reduce((acc, curr) => acc + curr.risk_score, 0) / analytics.trends.length)
        : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Security Overview</h2>
                <p className="text-slate-400">Real-time threat intelligence and system status.</p>
            </header>

            {/* 3D Status Centerpiece */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[400px]">
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        <StatCard title="Security Score" value={85} trend="+5%" icon={Shield} color="text-emerald-400" />
                        <StatCard title="Active Threats" value={3} trend="-2" icon={AlertTriangle} color="text-red-400" />
                        <StatCard title="Vulnerabilities" value={12} trend="-15%" icon={Activity} color="text-amber-400" />
                        <StatCard title="System Uptime" value="99.9%" trend="Stable" icon={Zap} color="text-sky-400" />
                    </div>
                </div>

                <div className="bg-slate-900/50 rounded-3xl border border-indigo-500/30 relative overflow-hidden flex flex-col items-center justify-center p-4 backdrop-blur-sm shadow-xl shadow-indigo-900/10">
                    <div className="absolute top-4 left-4 z-10">
                        <h3 className="text-white font-bold flex items-center gap-2"><Cpu size={18} className="text-indigo-400" /> Core System</h3>
                        <p className="text-xs text-indigo-300/60">Holographic Monitor Active</p>
                    </div>
                    <HoloCube className="w-full h-full absolute inset-0" />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-6">Risk Trend Analysis</h3>
                    <RiskTrendChart data={analytics.trends} />
                </div>

                <div className="space-y-8">
                    {/* Live Terminal Widget */}
                    <div className="h-[300px]">
                        <LiveTerminal />
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                        <h3 className="text-xl font-semibold text-white mb-6">Vulnerability Distribution</h3>
                        <div className="space-y-4">
                            {Object.entries(analytics.vulnerability_distribution).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-3 h-3 rounded-full ${key === 'High' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                            key === 'Medium' ? 'bg-amber-500' : 'bg-sky-500'
                                            }`}></span>
                                        <span className="text-slate-300 capitalize">{key}</span>
                                    </div>
                                    <span className="text-white font-mono font-bold">{value}</span>
                                </div>
                            ))}

                            {Object.keys(analytics.vulnerability_distribution).length === 0 && (
                                <p className="text-slate-500 text-sm">No vulnerabilities detected yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
