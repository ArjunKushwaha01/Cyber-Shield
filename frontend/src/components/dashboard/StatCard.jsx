import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={80} />
            </div>

            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-700/30 ${color} text-white`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {trend === 'up' ? '+' : ''}{trendValue}
                    </span>
                )}
            </div>

            <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <div className="text-3xl font-bold text-white">{value}</div>
        </motion.div>
    );
};

export default StatCard;
