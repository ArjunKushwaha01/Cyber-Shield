import { useState, useEffect, useRef } from 'react';
import { Terminal, Minus, Square } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveTerminal = () => {
    const [lines, setLines] = useState([
        { text: "Initializing CyberShield Kernel v2.4...", color: "text-emerald-500" },
        { text: "Loading threat intelligence modules...", color: "text-sky-400" },
        { text: "Connection established: Secure Node [192.168.1.X]", color: "text-slate-300" }
    ]);
    const scrollRef = useRef(null);

    const events = [
        { text: "Scanning port 443... Open", color: "text-emerald-400" },
        { text: "Analyzing traffic patterns...", color: "text-sky-400" },
        { text: "Packet trace complete.", color: "text-slate-400" },
        { text: "No active threats detected in sector 4.", color: "text-slate-500" },
        { text: "Background service sync: OK", color: "text-emerald-500" },
        { text: "Ping: 24ms", color: "text-slate-400" },
        { text: "Updating virus definitions...", color: "text-amber-400" },
        { text: "Firewall rules updated.", color: "text-sky-300" },
        { text: "System integrity verification: 100%", color: "text-emerald-400" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

            setLines(prev => {
                const newLines = [...prev, { ...randomEvent, timestamp }];
                if (newLines.length > 20) return newLines.slice(newLines.length - 20); // Keep last 20
                return newLines;
            });

        }, 2000); // New line every 2 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="bg-[#0c0c0c] border border-slate-700/50 rounded-lg overflow-hidden font-mono text-xs shadow-2xl h-full flex flex-col">
            {/* Terminal Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-slate-400" />
                    <span className="text-slate-400 font-medium">CyberShield CLI - /bin/monitor</span>
                </div>
                <div className="flex items-center gap-2 pr-2">
                    <Minus size={12} className="text-slate-500" />
                    <Square size={10} className="text-slate-500" />
                </div>
            </div>

            {/* Terminal Body */}
            <div
                ref={scrollRef}
                className="p-4 overflow-y-auto space-y-1 flex-1 max-h-[250px] scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${line.color} flex gap-3`}
                    >
                        <span className="text-slate-600 select-none">[{line.timestamp || "SYSTEM"}]</span>
                        <span>{'>'} {line.text}</span>
                    </motion.div>
                ))}
                <div className="animate-pulse text-emerald-500">_</div>
            </div>
        </div>
    );
};

export default LiveTerminal;
