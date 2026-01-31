import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, AlertTriangle, CheckCircle, Database, Lock, EyeOff, UserX } from 'lucide-react';

const DarkWebMonitor = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // Simulate API delay
        setTimeout(() => {
            setLoading(false);
            // Mock logic: if query contains "test", find breaches
            if (query.toLowerCase().includes('test') || query.toLowerCase().includes('demo')) {
                setResult({
                    found: true,
                    breaches: [
                        { source: 'LinkedIn Scraping', date: '2023-01-15', data: 'Emails, Job Titles' },
                        { source: 'Adobe Hack', date: '2022-10-04', data: 'Passwords (Encrypted), Emails' },
                        { source: 'Collection #1', date: '2019-01-07', data: 'Email, Plaintext Passwords' }
                    ]
                });
            } else {
                setResult({ found: false });
            }
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                        <EyeOff className="text-rose-400" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Dark Web Monitor</h2>
                </div>
                <p className="text-slate-400 max-w-2xl">
                    Search illegal marketplaces and pastebins to see if your credentials have been compromised in known data breaches.
                </p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-xl"
            >
                <form onSubmit={handleSearch} className="space-y-6">
                    <div className="relative">
                        <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text" // 'email' type often triggers browser autocomplete for login, 'text' is better for 'search'
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-mono"
                            placeholder="Enter email address or domain (e.g. user@example.com)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Scanning Dark Web...' : 'Check for Leaks'}
                    </motion.button>
                </form>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8 overflow-hidden"
                        >
                            {result.found ? (
                                <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4 text-red-400">
                                        <AlertTriangle size={24} />
                                        <h3 className="text-xl font-bold">Compromise Detected</h3>
                                    </div>
                                    <p className="text-slate-300 mb-6">
                                        The identity <span className="text-white font-mono font-bold">{query}</span> appeared in <span className="text-red-400 font-bold">{result.breaches.length} known breaches</span>.
                                    </p>

                                    <div className="space-y-3">
                                        {result.breaches.map((breach, i) => (
                                            <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h4 className="font-bold text-white">{breach.source}</h4>
                                                    <p className="text-xs text-slate-500">Breach Date: {breach.date}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Compromised Data:</span>
                                                    <span className="text-sm text-rose-300 font-mono">{breach.data}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-red-500/20">
                                        <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Lock size={16} /> Recommended Actions:</h4>
                                        <ul className="list-disc list-inside text-slate-400 space-y-1 text-sm">
                                            <li>Change passwords immediately on affected services.</li>
                                            <li>Enable Two-Factor Authentication (2FA) where possible.</li>
                                            <li>Use a password manager to generate unique passwords.</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6 text-center">
                                    <div className="inline-flex p-3 rounded-full bg-emerald-500/10 mb-4">
                                        <CheckCircle size={32} className="text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Good News!</h3>
                                    <p className="text-slate-300">
                                        No breaches found for <span className="text-white font-mono">{query}</span> in our database.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default DarkWebMonitor;
