import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Shield, Code, Lock, Server, Globe, Hash, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const KnowledgeBase = () => {
    const [selectedId, setSelectedId] = useState(null);

    const vulnerabilities = [
        {
            id: 'sql-injection',
            title: 'SQL Injection (SQLi)',
            severity: 'High',
            color: 'text-red-400',
            icon: Server,
            description: "Occurs when an application interferes with the queries an application makes to its database. It allows an attacker to view data that they are not normally able to retrieve.",
            vulnerableCode: `const query = "SELECT * FROM users WHERE user_id = " + req.query.id;`,
            secureCode: `const query = "SELECT * FROM users WHERE user_id = ?";
db.execute(query, [req.query.id]);`
        },
        {
            id: 'xss',
            title: 'Cross-Site Scripting (XSS)',
            severity: 'Medium',
            color: 'text-amber-400',
            icon: Globe,
            description: "Allows attackers to inject malicious scripts into web pages viewed by other users. These scripts can steal session cookies or perform actions on behalf of the user.",
            vulnerableCode: `<div>Welcome, {userInput}</div>`,
            secureCode: `<div>Welcome, {escape(userInput)}</div>`
        },
        {
            id: 'csrf',
            title: 'Cross-Site Request Forgery (CSRF)',
            severity: 'Medium',
            color: 'text-amber-400',
            icon: Lock,
            description: "Forces an end user to execute unwanted actions on a web application in which they're currently authenticated.",
            vulnerableCode: `<form action="/transfer" method="POST">
  <input type="hidden" name="amount" value="1000">
</form>`,
            secureCode: `<input type="hidden" name="csrf_token" value="{token}">`
        },
        {
            id: 'idor',
            title: 'Insecure Direct Object References (IDOR)',
            severity: 'High',
            color: 'text-red-400',
            icon: Hash,
            description: "Occurs when an application provides direct access to objects based on user-supplied input.",
            vulnerableCode: `app.get('/invoice/:id', (req, res) => {
  let invoice = db.getInvoice(req.params.id);
  res.send(invoice);
});`,
            secureCode: `app.get('/invoice/:id', (req, res) => {
  if (!user.owns(req.params.id)) return res.sendStatus(403);
  // ...
});`
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <BookOpen className="text-indigo-400" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Security Knowledge Base</h2>
                </div>
                <p className="text-slate-400 max-w-2xl">
                    Master modern web security. Explore common vulnerabilities, understand their mechanics, and learn secure coding practices.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {vulnerabilities.map((vuln) => (
                    <motion.div
                        key={vuln.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                        onClick={() => setSelectedId(selectedId === vuln.id ? null : vuln.id)}
                        className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border ${selectedId === vuln.id ? 'border-sky-500/50 bg-slate-800/80 shadow-lg shadow-sky-900/20' : 'border-slate-700/50 hover:border-slate-600'} overflow-hidden cursor-pointer transition-all duration-300`}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-slate-900/50 ${vuln.color}`}>
                                        <vuln.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{vuln.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${vuln.severity === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {vuln.severity}
                                            </span>
                                            <span>•</span>
                                            <span>Full Integrity Check</span>
                                        </div>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: selectedId === vuln.id ? 180 : 0 }}
                                    className="text-slate-500"
                                >
                                    <ChevronDown size={24} />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {selectedId === vuln.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-6 mt-6 border-t border-slate-700/50 space-y-6">
                                            <p className="text-slate-300 leading-relaxed text-lg">
                                                {vuln.description}
                                            </p>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <h4 className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider">
                                                        <AlertTriangle size={16} /> Vulnerable Code
                                                    </h4>
                                                    <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 font-mono text-sm text-red-200 overflow-x-auto">
                                                        <pre>{vuln.vulnerableCode}</pre>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                                                        <Shield size={16} /> Secure Implementation
                                                    </h4>
                                                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 font-mono text-sm text-emerald-200 overflow-x-auto">
                                                        <pre>{vuln.secureCode}</pre>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default KnowledgeBase;
