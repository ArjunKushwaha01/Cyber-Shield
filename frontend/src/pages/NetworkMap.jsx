import { useState } from 'react';
import { Share2, Globe, Minimize2, Maximize2 } from 'lucide-react';
import AttackGlobe from '../components/visuals/AttackGlobe';

const NetworkMap = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <div className={`
            relative bg-slate-900/50 rounded-3xl border border-slate-700/50 backdrop-blur-xl overflow-hidden animate-fade-in group
             transition-all duration-500
             ${isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[80vh]'}
        `}>
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <header className="absolute top-6 left-6 z-10 pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <Globe className="text-indigo-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white shadow-black drop-shadow-md">Global Threat Map</h2>
                </div>
                <p className="text-slate-400 text-sm max-w-md">3D visualization of active attack vectors and geo-located threats.</p>
            </header>

            {/* Controls */}
            <div className="absolute top-6 right-6 z-20 flex gap-2">
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl border border-slate-600 transition-colors backdrop-blur-sm"
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
            </div>

            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <AttackGlobe />
            </div>

            {/* Overlay Stats */}
            <div className="absolute bottom-6 left-6 z-10 p-4 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700 text-sm space-y-2 pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-slate-300">Live Attacks: <span className="text-white font-bold">15</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span className="text-slate-300">Monitored Nodes: <span className="text-white font-bold">1,240</span></span>
                </div>
            </div>
        </div>
    );
};

export default NetworkMap;
