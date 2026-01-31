import { useState, useRef, useEffect } from 'react';
import { FileUp, Shield, AlertTriangle, Database, CheckCircle, XCircle, ChevronRight, Lock, FileText, UploadCloud, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

const DataAuditor = () => {
    const [file, setFile] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setReport(null);
            setError(null);
            // Auto upload? Let's make it manual for clarity
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setReport(null);
            setError(null);
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/audit/upload`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error("Analysis failed. Please try a different file.");
            const data = await res.json();
            setReport(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Database Security Auditor</h2>
                <p className="text-slate-400">Upload database files (SQLite, SQL, CSV, JSON) to scan for vulnerabilities and structural issues.</p>
            </header>

            {/* Upload Area */}
            <div className="flex justify-center">
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full max-w-2xl min-h-[250px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer relative overflow-hidden backdrop-blur-xl
                        ${file ? 'border-sky-500/50 bg-sky-500/5' : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'}
                    `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".db,.sqlite,.sql,.csv,.json"
                    />

                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                key="prompt"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700 shadow-xl">
                                    <CloudUpIcon className="text-slate-400" size={32} />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-slate-200">Drag & Drop your Database file</p>
                                    <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                                </div>
                                <div className="flex gap-2 justify-center text-xs text-slate-500 font-mono">
                                    <span className="bg-slate-800 px-2 py-1 rounded">.DB</span>
                                    <span className="bg-slate-800 px-2 py-1 rounded">.SQL</span>
                                    <span className="bg-slate-800 px-2 py-1 rounded">.CSV</span>
                                    <span className="bg-slate-800 px-2 py-1 rounded">.JSON</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="selected"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto border border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                                    <FileText className="text-sky-400" size={32} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">{file.name}</p>
                                    <p className="text-sm text-sky-400 mt-1">{(file.size / 1024).toFixed(2)} KB • Ready to Scan</p>
                                </div>
                                {!loading && !report && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                        className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-sky-900/20 transition-all flex items-center gap-2 mx-auto"
                                    >
                                        <Shield size={20} /> Run Security Audit
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            <div className="w-16 h-16 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-sky-400 font-medium animate-pulse">Analyzing Structure & Secrets...</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto">
                    <XCircle size={20} />
                    {error}
                </div>
            )}

            {/* Results Section */}
            {report && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Score Card */}
                        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${report.security_score > 80 ? 'text-emerald-500' : 'text-red-500'}`}>
                                <Shield size={100} />
                            </div>
                            <h3 className="text-slate-400 text-sm font-medium mb-1">Security Score</h3>
                            <div className={`text-4xl font-bold ${report.security_score > 80 ? 'text-emerald-400' : report.security_score > 50 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                {report.security_score}/100
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                                {report.security_score > 80 ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                                {report.security_score > 80 ? "Database is secure" : "Issues detected"}
                            </div>
                        </div>

                        {/* File Info */}
                        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                            <h3 className="text-slate-400 text-sm font-medium mb-4">File Metadata</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Type</span>
                                    <span className="text-white font-mono text-sm">{report.file_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Size</span>
                                    <span className="text-white font-mono text-sm">{(report.size_bytes / 1024).toFixed(2)} KB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Structure</span>
                                    <span className={`font-medium ${report.structure.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {report.structure.valid ? 'Valid' : 'Corrupt/Invalid'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                            <h3 className="text-slate-400 text-sm font-medium mb-4">Findings Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Vulnerabilities</span>
                                    <span className="text-white font-bold">{report.vulnerabilities.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tables Detected</span>
                                    <span className="text-white font-bold">{report.structure.tables?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Vulnerabilities List */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
                                <AlertTriangle className="text-amber-400" size={20} />
                                <h3 className="font-bold text-white">Security Findings</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {report.vulnerabilities.length === 0 ? (
                                    <div className="text-center text-slate-500 py-8">
                                        <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500/50" />
                                        <p>No vulnerabilities found.</p>
                                    </div>
                                ) : (
                                    report.vulnerabilities.map((vuln, idx) => (
                                        <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${vuln.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {vuln.severity}
                                                </span>
                                                <span className="text-slate-500 text-xs font-mono">{vuln.type}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm mb-2">{vuln.finding}</p>
                                            {vuln.sample && (
                                                <div className="bg-slate-950 p-2 rounded text-xs font-mono text-slate-400 border border-slate-800">
                                                    Sample: {JSON.stringify(vuln.sample)}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Structure View */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
                                <Database className="text-sky-400" size={20} />
                                <h3 className="font-bold text-white">Database Structure</h3>
                            </div>
                            <div className="p-6">
                                {report.structure.tables && report.structure.tables.length > 0 ? (
                                    <div className="space-y-3">
                                        {report.structure.tables.map((table, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-800 rounded">
                                                        <Database size={14} className="text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{table.name}</p>
                                                        <p className="text-xs text-slate-500">{table.columns} Columns</p>
                                                    </div>
                                                </div>
                                                {table.has_primary_key !== undefined && (
                                                    <span className={`text-xs px-2 py-1 rounded ${table.has_primary_key ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {table.has_primary_key ? 'PK Found' : 'Missing PK'}
                                                    </span>
                                                )}
                                                {table.rows !== undefined && (
                                                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                                        {table.rows} Rows
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 py-8">
                                        <p>Structure analysis unavailable for this file type.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Data Explorer & Chat Section */}
            {report && report.structure.preview && report.structure.preview.rows.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <DataExplorer preview={report.structure.preview} />
                    </div>
                    <div className="lg:col-span-1">
                        <DataChat context={report.structure.preview} />
                    </div>
                </div>
            )}
        </div>
    );
};

const DataChat = ({ context }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I analyzed your data. Ask me questions like "How many rows?" or "Find admin".' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/ai/data-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg, context: context })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't process that." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 flex flex-col h-[500px]"
        >
            <div className="p-4 border-b border-slate-700/50 bg-slate-900/40 flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Sparkles size={18} className="text-indigo-400" />
                </div>
                <h3 className="font-bold text-white">AI Analyst</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-slate-700 text-slate-200 rounded-bl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-700 p-3 rounded-xl rounded-bl-none">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-700/50 bg-slate-900/20">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your data..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-800 rounded-lg text-indigo-400 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

const DataExplorer = ({ preview }) => {
    const [sortedRows, setSortedRows] = useState(preview.rows);
    const [isCleaned, setIsCleaned] = useState(false);

    const handleOrganize = () => {
        // 1. Sort Alphabetically by First Column
        const sorted = [...sortedRows].sort((a, b) => {
            const valA = String(a[0] || '').toLowerCase();
            const valB = String(b[0] || '').toLowerCase();
            return valA.localeCompare(valB);
        });
        setSortedRows(sorted);
        setIsCleaned(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden"
        >
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/40">
                <div className="flex items-center gap-3">
                    <Database className="text-sky-400" size={20} />
                    <div>
                        <h3 className="font-bold text-white">Data Explorer</h3>
                        <p className="text-xs text-slate-400">Previewing first 20 rows</p>
                    </div>
                </div>

                <button
                    onClick={handleOrganize}
                    disabled={isCleaned}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
                        ${isCleaned
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        }
                    `}
                >
                    {isCleaned ? (
                        <><CheckCircle size={16} /> Organized</>
                    ) : (
                        <><Sparkles size={16} /> Organize Data</>
                    )}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 sticky top-0">
                            {preview.headers.map((h, i) => (
                                <th key={i} className="px-6 py-4 font-mono uppercase text-xs tracking-wider whitespace-nowrap">
                                    {isCleaned ? h.trim().toUpperCase() : h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {sortedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-6 py-3 text-slate-300 font-mono text-xs whitespace-nowrap">
                                        {cell !== null ? String(cell) : <span className="text-slate-600">NULL</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

const CloudUpIcon = ({ className, size }) => (
    <UploadCloud className={className} size={size} />
);

export default DataAuditor;
