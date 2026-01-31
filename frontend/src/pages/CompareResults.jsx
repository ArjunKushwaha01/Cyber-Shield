import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertTriangle, Minus, ArrowRight, Shield } from 'lucide-react';
import { API_BASE_URL } from '../config';

const CompareResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [scanA, setScanA] = useState(null);
    const [scanB, setScanB] = useState(null);

    useEffect(() => {
        const fetchScans = async () => {
            const id1 = searchParams.get('id1');
            const id2 = searchParams.get('id2');

            if (!id1 || !id2) return;

            try {
                const [resA, resB] = await Promise.all([
                    fetch(`${API_BASE_URL}/scans/${id1}`),
                    fetch(`${API_BASE_URL}/scans/${id2}`)
                ]);

                const dataA = await resA.json();
                const dataB = await resB.json();

                // Order by date: A = Older, B = Newer
                if (new Date(dataA.scan_date) > new Date(dataB.scan_date)) {
                    setScanA(dataB);
                    setScanB(dataA);
                } else {
                    setScanA(dataA);
                    setScanB(dataB);
                }
            } catch (err) {
                console.error("Error fetching comparison data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchScans();
    }, [searchParams]);

    if (loading) return <div className="text-white text-center mt-20">Analyzing Diff Vectors...</div>;
    if (!scanA || !scanB) return <div className="text-red-400 text-center mt-20">Comparison data not available.</div>;

    // Diff Logic
    const riskDiff = scanB.risk_score - scanA.risk_score;
    const isImproved = riskDiff < 0;

    // Simplified Diff: Compare vulnerability names (naïve approach for demo)
    const vulnsA = new Set(scanA.scan_details.map(v => v.vulnerability));
    const vulnsB = new Set(scanB.scan_details.map(v => v.vulnerability));

    const fixedVulns = [...vulnsA].filter(v => !vulnsB.has(v));
    const newVulns = [...vulnsB].filter(v => !vulnsA.has(v));
    const persistingVulns = [...vulnsB].filter(v => vulnsA.has(v));

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            <header className="flex items-center gap-4">
                <button onClick={() => navigate('/history')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                    <ArrowLeft />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-white">Scan Comparison Report</h2>
                    <p className="text-slate-400">Analyzing security posture drift between assessments.</p>
                </div>
            </header>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h4 className="text-slate-400 text-sm uppercase mb-2">Risk Score Delta</h4>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-white">{scanA.risk_score}</span>
                        <ArrowRight className="text-slate-500" />
                        <span className={`text-3xl font-bold ${isImproved ? 'text-emerald-400' : 'text-red-400'}`}>
                            {scanB.risk_score}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isImproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {riskDiff > 0 ? `+${riskDiff}` : riskDiff}
                        </span>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h4 className="text-slate-400 text-sm uppercase mb-2">Vulnerabilities Fixed</h4>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-emerald-400" />
                        <span className="text-2xl font-bold text-white">{fixedVulns.length}</span>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h4 className="text-slate-400 text-sm uppercase mb-2">New Issues Found</h4>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-red-400" />
                        <span className="text-2xl font-bold text-white">{newVulns.length}</span>
                    </div>
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Fixed Issues */}
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                    <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle /> Resolved Issues
                    </h3>
                    {fixedVulns.length === 0 ? (
                        <div className="p-6 rounded-xl border border-slate-800 text-slate-500 italic">No fixed issues detected.</div>
                    ) : (
                        fixedVulns.map((v, i) => (
                            <div key={i} className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                                <Shield size={18} className="text-emerald-400" />
                                <span className="text-emerald-100 font-mono text-sm">{v}</span>
                            </div>
                        ))
                    )}
                </motion.div>

                {/* New Issues */}
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                    <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                        <AlertTriangle /> New Vulnerabilities
                    </h3>
                    {newVulns.length === 0 ? (
                        <div className="p-6 rounded-xl border border-slate-800 text-slate-500 italic">No new vulnerabilities introduced.</div>
                    ) : (
                        newVulns.map((v, i) => (
                            <div key={i} className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                                <AlertTriangle size={18} className="text-red-400" />
                                <span className="text-red-100 font-mono text-sm">{v}</span>
                            </div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default CompareResults;
