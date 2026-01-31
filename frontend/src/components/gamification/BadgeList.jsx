import { motion } from 'framer-motion';
import { Award, Shield, Zap, Target, Lock } from 'lucide-react';

const BadgeList = ({ analytics }) => {
    if (!analytics) return null;

    const totalScans = analytics.trends.length;
    const avgRisk = analytics.trends.length > 0
        ? Math.round(analytics.trends.reduce((acc, curr) => acc + curr.risk_score, 0) / analytics.trends.length)
        : 0;
    const totalVulns = Object.values(analytics.vulnerability_distribution).reduce((a, b) => a + b, 0);

    const badges = [
        {
            id: 'rookie',
            label: 'Cyber Rookie',
            description: 'Completed your first scan.',
            icon: Shield,
            color: 'from-blue-500 to-cyan-400',
            unlocked: totalScans >= 1
        },
        {
            id: 'veteran',
            label: 'Security Veteran',
            description: 'Conducted 5+ assessments.',
            icon: Award,
            color: 'from-purple-500 to-pink-500',
            unlocked: totalScans >= 5
        },
        {
            id: 'fortress',
            label: 'Digital Fortress',
            description: 'Achieved an Avg Risk Score > 80.',
            icon: Lock,
            color: 'from-emerald-500 to-teal-400',
            unlocked: avgRisk >= 80 && totalScans > 0
        },
        {
            id: 'hunter',
            label: 'Bug Hunter',
            description: 'Detected 10+ vulnerabilities.',
            icon: Target,
            color: 'from-amber-500 to-orange-500',
            unlocked: totalVulns >= 10
        }
    ];

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Zap className="text-yellow-400 fill-yellow-400" size={20} /> Achievements
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: badge.unlocked ? 1 : 0.4, scale: 1 }}
                        className={`relative p-4 rounded-xl border ${badge.unlocked
                            ? 'bg-slate-900/50 border-slate-600 shadow-lg'
                            : 'bg-slate-900/20 border-slate-800 grayscale'}`}
                    >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${badge.color} flex items-center justify-center mb-3 shadow-inner`}>
                            <badge.icon size={20} className="text-white" />
                        </div>
                        <h4 className="font-bold text-slate-200 text-sm mb-1">{badge.label}</h4>
                        <p className="text-xs text-slate-500 leading-tight">{badge.description}</p>

                        {!badge.unlocked && (
                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                                <Lock size={16} className="text-slate-600" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default BadgeList;
