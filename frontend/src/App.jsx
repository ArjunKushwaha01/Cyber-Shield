import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ScanNew from './pages/ScanNew';
import History from './pages/History';

import Reports from './pages/Reports';
import DataAuditor from './pages/DataAuditor';
import LogForensics from './pages/LogForensics';
import KnowledgeBase from './pages/KnowledgeBase';
import DarkWebMonitor from './pages/DarkWebMonitor';
import CompareResults from './pages/CompareResults';
import Achievements from './pages/Achievements';
import ScheduleManager from './pages/ScheduleManager';
import NetworkMap from './pages/NetworkMap';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/scan" element={<ScanNew />} />
          <Route path="/history" element={<History />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/audit" element={<DataAuditor />} />
          <Route path="/logs" element={<LogForensics />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/monitor" element={<DarkWebMonitor />} />
          <Route path="/map" element={<NetworkMap />} />
          <Route path="/compare" element={<CompareResults />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/automation" element={<ScheduleManager />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
