import { FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reports = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Reports Center</h2>
                <p className="text-slate-400">Generate and download security assessment reports.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col items-start gap-4 hover:border-sky-500/50 transition-colors group">
                    <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Single Scan Report</h3>
                        <p className="text-slate-400 mb-6">Generate a detailed PDF report for a completed security scan. You can do this immediately after a new scan.</p>
                        <Link to="/scan" className="text-white bg-sky-600 hover:bg-sky-500 px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">
                            Go to New Scan <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col items-start gap-4 hover:border-emerald-500/50 transition-colors group">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Historical Reports</h3>
                        <p className="text-slate-400 mb-6">Access past scan data and export historical findings. (Feature coming to History tab soon).</p>
                        <Link to="/history" className="text-white bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors">
                            View History <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
