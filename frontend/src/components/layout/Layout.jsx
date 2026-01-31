import Sidebar from './Sidebar';
import AICopilot from './AICopilot';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-sky-500/30">
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#0B1120] via-[#0f172a] to-[#0B1120] -z-10"></div>

            <Sidebar />
            <main className="ml-64 p-8 min-h-screen relative z-0">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
            <AICopilot />
        </div>
    );
};

export default Layout;
