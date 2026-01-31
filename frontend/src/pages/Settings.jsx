import { useState, useEffect } from 'react';
import { Save, Bell, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

const Settings = () => {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [status, setStatus] = useState('idle'); // idle, saving, success, error, testing

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/settings/webhook`);
                const data = await res.json();
                if (data.url) setWebhookUrl(data.url);
            } catch (err) {
                console.error("Failed to load settings");
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setStatus('saving');
        try {
            await fetch(`${API_BASE_URL}/settings/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: webhookUrl })
            });
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            setStatus('error');
        }
    };

    const handleTest = async () => {
        setStatus('testing');
        try {
            const res = await fetch(`${API_BASE_URL}/settings/webhook/test`, {
                method: 'POST'
            });
            if (res.ok) {
                alert("Test notification sent!");
            } else {
                alert("Failed to send test. Check URL.");
            }
        } catch (err) {
            alert("Error sending test.");
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Platform Settings</h2>
                <p className="text-slate-400">Configure integrations and notification preferences.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8"
            >
                <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Bell className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Webhook Integration</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Connect standard communication tools like Discord or Slack to receive real-time alerts.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Webhook URL</label>
                        <input
                            type="url"
                            required
                            placeholder="https://discord.com/api/webhooks/..."
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Paste a unique webhook URL from your provider (Discord/Slack/Teams).
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <button
                            type="button"
                            onClick={handleTest}
                            disabled={!webhookUrl}
                            className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <MessageSquare size={16} /> Test Notification
                        </button>

                        <button
                            type="submit"
                            disabled={status === 'saving'}
                            className={`
                                flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all text-white
                                ${status === 'success' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}
                            `}
                        >
                            {status === 'success' ? (
                                <> <CheckCircle size={18} /> Saved </>
                            ) : status === 'saving' ? (
                                <> Saving... </>
                            ) : (
                                <> <Save size={18} /> Save Changes </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Settings;
