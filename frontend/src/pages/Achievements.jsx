import { useState, useEffect } from 'react';
import BadgeList from '../components/gamification/BadgeList';
import { Trophy, Award } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Achievements = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/analytics`);
                const data = await res.json();
                setAnalytics(data);
            } catch (err) {
                console.error("Error loading analytics for awards", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="text-white">Loading Awards...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <Trophy className="text-yellow-400" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Security Achievements</h2>
                </div>
                <p className="text-slate-400 max-w-2xl">
                    Track your progress as a security researcher. Unlock badges by performing scans, finding vulnerabilities, and improving system security.
                </p>
            </header>

            {/* Reusing the BadgeList component but in a full-page context */}
            <div className="mt-8">
                <BadgeList analytics={analytics} />
            </div>

            {/* Future Leaderboard could go here */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center mt-12">
                <Award size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-300">More Challenges Coming Soon</h3>
                <p className="text-slate-500 mt-2">
                    Keep scanning to climb the (planned) global leaderboards.
                </p>
            </div>
        </div>
    );
};

export default Achievements;
