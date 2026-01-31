import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, ShieldAlert, Activity, FileText, Server, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { API_BASE_URL } from '../config';

const LogForensics = () => {
    const [file, setFile] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    }

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/audit/logs`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setReport(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Prepare Chart Data
    // Prepare Chart Data
    const ipData = report && report.valid ? report.analysis.top_ips.map(i => ({ name: i.ip, count: i.count })) : [];
    const statusData = report && report.valid ? Object.entries(report.analysis.status_codes).map(([k, v]) => ({ name: k, value: v })) : [];
    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Server Log Forensics</h2>
                <p className="text-slate-400">Analyze Apache/Nginx access logs for attack signatures and traffic anomalies.</p>
            </header>

            {/* Upload Section */}
            {!report && (
                <div className="flex justify-center">
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="w-full max-w-2xl min-h-[250px] border-2 border-dashed border-slate-700 bg-slate-800/30 hover:border-sky-500/50 hover:bg-slate-800/50 rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" accept=".log,.txt" onChange={handleFileChange} />

                        {!file ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                                    <Server className="text-slate-400" size={28} />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-slate-200">Upload access.log</p>
                                    <p className="text-sm text-slate-500">Supports Standard Common Log Format (CLF)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto border border-sky-500/30">
                                    <FileText className="text-sky-400" size={28} />
                                </div>
                                <p className="text-white font-bold">{file.name}</p>
                                {!loading && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                        className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-sky-900/20 transition-all"
                                    >
                                        Analyze Logs
                                    </button>
                                )}
                            </div>
                        )}

                        {loading && <p className="mt-4 text-sky-400 animate-pulse">Parsing log lines...</p>}
                    </motion.div>
                </div>
            )}

            {/* Error Message */}
            {report && !report.valid && (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
                    <p className="text-slate-400 max-w-md mb-6">{report.error || "Could not parse this log file."}</p>
                    <button
                        onClick={() => { setReport(null); setFile(null); }}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                    >
                        Try Another File
                    </button>
                </div>
            )}

            {/* Dashboard */}
            {report && report.valid && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatBox label="Total Requests" value={report.parsed_lines} icon={Activity} color="text-sky-400" />
                        <StatBox label="Threats Found" value={report.analysis.threat_count} icon={ShieldAlert} color="text-red-400" />
                        <StatBox label="Error Rate (5xx)" value={report.analysis.status_codes['500'] || 0} icon={AlertTriangle} color="text-amber-400" />
                        <StatBox label="Unique IPs" value={ipData.length} icon={Server} color="text-emerald-400" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Traffic Chart */}
                        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white mb-6">Top Traffic Sources</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ipData} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                        <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Status Codes */}
                        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white mb-6">Response Codes</h3>
                            <div className="h-[300px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 text-xs text-slate-400">
                                {statusData.map((s, i) => (
                                    <span key={i} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Threat Table */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-700/50 flex items-center gap-3 bg-red-500/5">
                            <ShieldAlert className="text-red-400" />
                            <div>
                                <h3 className="text-lg font-bold text-white">Detected Threats</h3>
                                <p className="text-xs text-slate-400">SQL Injection, XSS, and Path Traversal attempts</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-900/50 text-slate-400">
                                    <tr>
                                        <th className="p-4">Timestamp</th>
                                        <th className="p-4">Attacker IP</th>
                                        <th className="p-4">Attack Type</th>
                                        <th className="p-4">Payload (Path)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {report.analysis.threats.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-slate-500">
                                                <CheckCircle className="mx-auto mb-2 text-emerald-500" />
                                                No threats detected in this log file.
                                            </td>
                                        </tr>
                                    ) : (
                                        report.analysis.threats.map((t, i) => (
                                            <tr key={i} className="hover:bg-red-500/5 transition-colors">
                                                <td className="p-4 font-mono text-slate-400">{t.timestamp}</td>
                                                <td className="p-4 font-mono text-white">{t.ip}</td>
                                                <td className="p-4"><span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">{t.type}</span></td>
                                                <td className="p-4 font-mono text-slate-400 max-w-xs truncate" title={t.payload}>{t.payload}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </motion.div>
            )}
        </div>
    );
};

const StatBox = ({ label, value, icon: Icon, color }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">{label}</span>
            <Icon size={18} className={color} />
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
    </div>
);

export default LogForensics;
