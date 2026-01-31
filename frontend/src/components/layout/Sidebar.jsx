import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScanLine, History, FileText, Shield, BookOpen, EyeOff, Trophy, Clock, Share2, Settings as SettingsIcon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();
    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
        { path: '/scan', icon: ScanLine, label: 'New Scan' },
        { path: '/history', icon: History, label: 'History' },
        { path: '/reports', icon: FileText, label: 'Reports' },
        { path: '/audit', icon: Shield, label: 'Data Auditor' },
        { path: '/logs', icon: FileText, label: 'Log Forensics' },
        { path: '/knowledge', icon: BookOpen, label: 'Knowledge Base' },
        { path: '/monitor', icon: EyeOff, label: 'Dark Web Monitor' },
        { path: '/map', icon: Share2, label: 'Attack Map' },
        { path: '/achievements', icon: Trophy, label: 'Achievements' },
        { path: '/automation', icon: Clock, label: 'Automation' },
        { path: '/settings', icon: SettingsIcon, label: 'Settings' },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-10">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-sky-600 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                    CyberShield
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-sky-600/20 to-sky-900/20 border-l-2 border-sky-500 rounded-r-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon size={20} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-sky-400' : 'group-hover:text-sky-300'}`} />
                                    <span className="relative z-10 font-medium">{item.label}</span>

                                    {/* Subtle Glow on Hover */}
                                    {!isActive && (
                                        <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">Pro Status</h3>
                    <p className="text-xs text-slate-500 mb-3">System Online & Secure</p>
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Connected
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
