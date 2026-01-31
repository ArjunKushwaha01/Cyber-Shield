import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Clock, CheckCircle, XCircle, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

const ScheduleManager = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newSchedule, setNewSchedule] = useState({ target_url: '', frequency: 'daily' });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/schedules`);
            const data = await res.json();
            setSchedules(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchedule)
            });
            if (res.ok) {
                setShowForm(false);
                setNewSchedule({ target_url: '', frequency: 'daily' });
                fetchSchedules();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Stop this automated scan?')) return;
        try {
            await fetch(`${API_BASE_URL}/schedules/${id}`, { method: 'DELETE' });
            setSchedules(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <Clock className="text-purple-400" size={24} />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Automation Rules</h2>
                    </div>
                    <p className="text-slate-400">Configure recurring security assessments.</p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/20"
                >
                    <Plus size={18} /> New Schedule
                </button>
            </header>

            {/* Creation Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleCreate} className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl mb-8 grid md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Target URL</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://example.com"
                                    value={newSchedule.target_url}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, target_url: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400">Frequency</label>
                                <select
                                    value={newSchedule.frequency}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="daily">Daily (Every 24h)</option>
                                    <option value="weekly">Weekly (Every 7 days)</option>
                                    <option value="monthly">Monthly (Every 30 days)</option>
                                </select>
                            </div>
                            <button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 rounded-lg transition-colors">
                                Save Rule
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Schedule List */}
            <div className="grid gap-4">
                {loading ? <div className="text-white">Loading...</div> : schedules.length === 0 ? (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
                        <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium text-slate-300">No active schedules</h3>
                        <p className="text-slate-500">Create a rule to automate your security checks.</p>
                    </div>
                ) : (
                    schedules.map((s) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-purple-500/30 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                                    <Calendar className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white font-mono">{s.target_url}</h3>
                                    <div className="flex items-center gap-4 text-sm mt-1">
                                        <span className="flex items-center gap-1 text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded capitalize">
                                            <Play size={12} /> {s.frequency}
                                        </span>
                                        <span className="text-slate-500">
                                            Next Run: {new Date(s.next_run).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle size={12} /> Active
                                </div>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ScheduleManager;
