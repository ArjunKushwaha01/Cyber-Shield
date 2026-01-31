import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertTriangle, CheckCircle, Info, FileText } from 'lucide-react';
import { generatePDFReport } from '../../utils/pdfGenerator';

const DetailsModal = ({ scan, onClose }) => {
    if (!scan) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl relative"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md p-6 border-b border-slate-800 flex justify-between items-center z-10">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Scan Details</h3>
                            <p className="text-sm text-slate-400 font-mono">{scan.url}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => generatePDFReport(scan)} className="text-sky-400 hover:text-white transition-colors bg-sky-900/50 p-2 rounded-full hover:bg-sky-600 border border-sky-800">
                                <FileText size={20} />
                            </button>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Score & Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                                <span className="text-slate-400 text-sm mb-2">Risk Score</span>
                                <span className={`text-4xl font-bold ${scan.risk_score > 70 ? 'text-emerald-400' :
                                    scan.risk_score > 40 ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    {scan.risk_score}
                                </span>
                            </div>
                            <div className="md:col-span-2 bg-slate-800 p-4 rounded-xl border border-slate-700">
                                <h4 className="text-sky-400 font-medium mb-2 text-sm uppercase tracking-wider">AI Summary</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {scan.ai_analysis.summary}
                                </p>
                            </div>
                        </div>

                        {/* Findings */}
                        <div>
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-amber-500" /> Vulnerabilities Found
                            </h4>
                            <div className="space-y-3">
                                {(scan.scan_details || []).map((detail, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${detail.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                detail.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                                }`}>
                                                {detail.severity === 'High' ? 'High (Critical Risk)' :
                                                    detail.severity === 'Medium' ? 'Medium (Significant Risk)' :
                                                        detail.severity === 'Low' ? 'Low (Minor Issue)' : 'Info (Observation)'}
                                            </span>
                                            {detail.cwe_id && (
                                                <span className="text-xs text-slate-500 font-mono border border-slate-700 px-2 py-1 rounded">
                                                    {detail.cwe_id}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-medium">
                                                {detail.risk_type || "General Security"}
                                            </span>
                                        </div>
                                        <h5 className="text-slate-200 font-medium mb-1">{detail.vulnerability}</h5>
                                        <p className="text-slate-400 text-sm">{detail.description}</p>
                                        {/* Recommendation if available directly on item */}
                                        {detail.recommendation && (
                                            <div className="mt-3 p-3 bg-slate-900/50 rounded-lg text-xs text-slate-300 border border-slate-800 flex gap-2">
                                                <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                {detail.recommendation}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {(scan.scan_details || []).length === 0 && (
                                    <p className="text-slate-500 italic">No specific vulnerabilities detected.</p>
                                )}
                            </div>
                        </div>

                        {/* AI Recommendations (Global) */}
                        {scan.ai_analysis.recommendations && (
                            <div>
                                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-emerald-500" /> Remediation Steps
                                </h4>
                                <ul className="space-y-2">
                                    {scan.ai_analysis.recommendations.map((rec, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-300 bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                                            <span className="text-emerald-500 font-bold">•</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DetailsModal;
