import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { API_BASE_URL } from '../config';
import { generatePDFReport } from '../utils/pdfGenerator';

const ScanNew = () => {
    const [url, setUrl] = useState('');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!consent) return;

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await fetch(`${API_BASE_URL}/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, consent })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        if (!results) return;
        generatePDFReport(results);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">New Assessment</h2>
                <p className="text-slate-400">Launch a comprehensive security scan against a target.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-xl"
            >
                <form onSubmit={handleScan} className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="url"
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-mono"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-900/30 rounded-xl border border-slate-800">
                        <input
                            type="checkbox"
                            id="consent"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-600 text-sky-500 focus:ring-sky-500 bg-slate-800"
                        />
                        <label htmlFor="consent" className="text-sm text-slate-300 cursor-pointer select-none">
                            I confirm I have explicit permission to scan this target for educational/defensive purposes.
                        </label>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading || !consent}
                        className="w-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Shield className="animate-spin" /> Scanning Initiated...
                            </>
                        ) : (
                            <>
                                Start Security Assessment <ArrowRight size={20} />
                            </>
                        )}
                    </motion.button>

                    {error && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="text-red-400 bg-red-900/20 p-4 rounded-xl border border-red-900/50 flex items-center gap-2">
                            <AlertTriangle size={18} /> {error}
                        </motion.div>
                    )}

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-8 flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-2xl border border-sky-500/30 relative overflow-hidden"
                        >
                            {/* Radar Effect */}
                            <div className="relative w-32 h-32 mb-6">
                                <motion.div
                                    className="absolute inset-0 border-4 border-sky-500/30 rounded-full"
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <motion.div
                                    className="absolute inset-0 border-t-4 border-emerald-400 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield className="w-12 h-12 text-sky-400" />
                                </div>
                            </div>

                            <motion.h3
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-xl font-bold text-sky-400 mb-2"
                            >
                                SYSTEM SCAN IN PROGRESS
                            </motion.h3>
                            <p className="text-slate-400 text-sm font-mono">Analyzing target vectors...</p>
                        </motion.div>
                    )}
                </form>
            </motion.div>

            <AnimatePresence>
                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-xl"
                    >
                        <div className="flex justify-between items-start mb-8 border-b border-slate-700 pb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Scan Results</h3>
                                <p className="text-slate-400 text-sm">Target: <span className="text-sky-400 font-mono">{url}</span></p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-sm text-slate-400 mb-1">Overall Risk Score</div>
                                    <div className={`text-4xl font-bold ${results.ai_analysis.risk_score > 70 ? 'text-emerald-400' :
                                        results.ai_analysis.risk_score > 40 ? 'text-amber-400' : 'text-red-400'
                                        }`}>
                                        {results.ai_analysis.risk_score}
                                    </div>
                                </div>
                                <button
                                    onClick={downloadReport}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {/* AI Summary */}
                            <div className="bg-slate-900/50 p-6 rounded-xl border-l-4 border-sky-500">
                                <h4 className="text-sky-400 font-medium mb-2 flex items-center gap-2">
                                    <Shield size={18} /> AI Analysis
                                </h4>
                                <p className="text-slate-300 leading-relaxed">{results.ai_analysis.summary}</p>
                            </div>

                            {/* Findings List */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-white">Vulnerability Findings</h4>
                                {results.scan_details.map((res, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-slate-900/40 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${res.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                res.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                                }`}>
                                                {res.severity === 'High' ? 'High (Critical Risk)' :
                                                    res.severity === 'Medium' ? 'Medium (Significant Risk)' :
                                                        res.severity === 'Low' ? 'Low (Minor Issue)' : 'Info (Observation)'}
                                            </span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="inline-block text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-medium">
                                                {res.risk_type || "General Security"}
                                            </span>
                                        </div>
                                        <h5 className="text-lg font-semibold text-white mb-1 font-mono">{res.vulnerability}</h5>
                                        <p className="text-slate-400 text-sm">{res.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScanNew;
