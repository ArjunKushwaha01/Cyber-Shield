import { useState, useEffect } from 'react';
import { Clock, ExternalLink, Eye, ArrowLeftRight, Trash2, FileText, FileJson } from 'lucide-react';
import { Link } from 'react-router-dom';
import DetailsModal from '../components/dashboard/DetailsModal';
import { API_BASE_URL } from '../config';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScan, setSelectedScan] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/history`);
            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error("Error fetching history", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = new Set(history.map(h => h.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} scan(s)?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/history/batch`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scan_ids: Array.from(selectedIds) })
            });

            if (res.ok) {
                // Remove deleted items from state locally to avoid refetch wait
                setHistory(prev => prev.filter(h => !selectedIds.has(h.id)));
                setSelectedIds(new Set());
            } else {
                console.error("Failed to delete scans");
            }
        } catch (err) {
            console.error("Error deleting scans", err);
        }
    };

    if (loading) return <div className="text-white">Loading History...</div>;

    return (
        <>
            <div className="space-y-8 animate-fade-in relative">
                <header className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Assessment History</h2>
                        <p className="text-slate-400">Archive of all past security scans and their results.</p>
                    </div>

                    {/* Default Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                const headers = ["Scan ID", "Date", "URL", "Risk Score", "Vulnerabilities Count", "Status"];
                                const rows = history.map(h => [
                                    h.id,
                                    new Date(h.scan_date).toLocaleString(),
                                    h.url,
                                    h.risk_score,
                                    (h.scan_details || []).length,
                                    h.risk_score > 70 ? "High Risk" : "Secure"
                                ]);

                                const csvContent = [
                                    headers.join(","),
                                    ...rows.map(r => r.map(c => `"${c}"`).join(","))
                                ].join("\n");

                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement("a");
                                link.href = URL.createObjectURL(blob);
                                link.download = `scan_history_${new Date().toISOString().slice(0, 10)}.csv`;
                                link.click();
                            }}
                            className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm border border-slate-600/50"
                        >
                            <FileText size={16} /> Export CSV
                        </button>

                        <button
                            onClick={() => {
                                const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                                    JSON.stringify(history, null, 2)
                                )}`;
                                const link = document.createElement("a");
                                link.href = jsonString;
                                link.download = `scan_history_full_${new Date().toISOString().slice(0, 10)}.json`;
                                link.click();
                            }}
                            className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm border border-slate-600/50"
                        >
                            <FileJson size={16} /> Export JSON
                        </button>
                    </div>

                    {/* Delete Action Bar */}
                    {selectedIds.size > 0 && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 shadow-2xl rounded-xl p-4 flex items-center gap-4 z-50 backdrop-blur-xl animate-fade-in">
                            <span className="text-slate-300 font-medium px-2">{selectedIds.size} selected</span>

                            {selectedIds.size === 2 && (
                                <Link
                                    to={`/compare?id1=${[...selectedIds][0]}&id2=${[...selectedIds][1]}`}
                                    className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeftRight size={16} /> Compare Scans
                                </Link>
                            )}

                            <div className="w-px h-6 bg-slate-700 mx-2" />

                            <button
                                onClick={handleDelete}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-red-500/20"
                            >
                                <Trash2 size={16} /> Delete Selected
                            </button>
                        </div>
                    )}
                </header>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm font-medium uppercase tracking-wider">
                                    <th className="p-6 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={history.length > 0 && selectedIds.size === history.length}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-6">Date Scanned</th>
                                    <th className="p-6">Target URL</th>
                                    <th className="p-6">Risk Score</th>
                                    <th className="p-6">Findings Count</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {history.map((scan) => {
                                    const isSelected = selectedIds.has(scan.id);
                                    return (
                                        <tr key={scan.id} className={`transition-colors group ${isSelected ? 'bg-sky-900/10' : 'hover:bg-slate-700/20'}`}>
                                            <td className="p-6 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectOne(scan.id)}
                                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-6 text-sm text-slate-300 font-mono">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-slate-500" />
                                                    {new Date(scan.scan_date).toLocaleDateString()}
                                                    <span className="text-slate-500 text-xs">{new Date(scan.scan_date).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <a href={scan.url} target="_blank" rel="noreferrer" className="text-sky-400 font-mono text-sm hover:underline flex items-center gap-2">
                                                    {scan.url}
                                                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            </td>
                                            <td className="p-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${scan.risk_score > 80 ? 'bg-emerald-500/10 text-emerald-400' :
                                                        scan.risk_score > 50 ? 'bg-amber-500/10 text-amber-400' :
                                                            'bg-red-500/10 text-red-400'}
                                        `}>
                                                    {scan.risk_score}/100
                                                </span>
                                            </td>
                                            <td className="p-6 text-sm text-slate-400">
                                                {(scan.scan_details || []).length} Issues
                                            </td>
                                            <td className="p-6 text-right">
                                                <button
                                                    onClick={() => setSelectedScan(scan)}
                                                    className="text-xs font-medium bg-slate-700 hover:bg-sky-600 text-slate-200 hover:text-white px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1"
                                                >
                                                    <Eye size={14} /> View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {history.length === 0 && (
                            <div className="p-12 text-center text-slate-500">
                                <Clock size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No scan history found. Start your first assessment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal */}
            </div >

            {
                selectedScan && (
                    <DetailsModal scan={selectedScan} onClose={() => setSelectedScan(null)} />
                )
            }
        </>
    );
};

export default History;
