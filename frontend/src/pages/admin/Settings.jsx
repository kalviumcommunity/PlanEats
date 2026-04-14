import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Globe, 
  Shield, 
  Eye, 
  Save,
  Database,
  Mail,
  Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'system', label: 'System', icon: <Database size={18} /> },
  ];

  const handleSave = () => {
    toast.success('Settings updated successfully (Demo)');
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
            <p className="text-gray-400 mt-1">Configure platform parameters and admin preferences.</p>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-yellow-500/20"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Tabs Sidebar */}
          <div className="md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-yellow-500 text-black font-bold' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 space-y-8">
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Platform Configuration</h3>
                
                <div className="grid gap-6">
                  <InputGroup 
                    label="Platform Name" 
                    value="PlanEats Admin" 
                    placeholder="Enter platform name"
                  />
                  <InputGroup 
                    label="Admin Email" 
                    value="admin@planeats.com" 
                    placeholder="Enter contact email"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest text-[10px]">Maintenance Mode</label>
                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-gray-800">
                      <div className="flex-1">
                        <p className="text-white font-medium">Disable Public Access</p>
                        <p className="text-xs text-gray-500">Only administrators will be able to access the platform.</p>
                      </div>
                      <div className="w-12 h-6 bg-gray-800 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-gray-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Security Protocol</h3>
                
                <div className="grid gap-6">
                  <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex gap-4">
                    <Shield className="text-yellow-500 shrink-0" size={24} />
                    <div>
                      <p className="text-white font-bold text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-400 mt-1">Protect your account with an extra layer of security. We recommend enabling 2FA for all admin accounts.</p>
                      <button className="mt-3 text-yellow-500 text-xs font-bold uppercase tracking-wider hover:underline">Enable Now →</button>
                    </div>
                  </div>

                  <InputGroup label="Session Timeout (minutes)" value="60" type="number" />
                  <InputGroup label="Password Policy" value="Complexity Required" disabled />
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Notification Center</h3>
                
                <div className="space-y-4">
                  <ToggleItem icon={<Mail size={18} />} title="Email Alerts" description="Receive updates on new recipe submissions via email." active />
                  <ToggleItem icon={<Smartphone size={18} />} title="Push Notifications" description="Real-time alerts for system critical events." active={false} />
                  <ToggleItem icon={<Shield size={18} />} title="Security Alerts" description="Notify on failed login attempts or role changes." active />
                </div>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">System Utilities</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-black/40 border border-gray-800 rounded-2xl hover:border-yellow-500/30 transition-all cursor-pointer group">
                    <Database className="text-gray-500 group-hover:text-yellow-500 mb-4" size={32} />
                    <h4 className="text-white font-bold">Clear Cache</h4>
                    <p className="text-xs text-gray-500 mt-2">Flush all server-side caches and temporary data.</p>
                  </div>
                  <div className="p-6 bg-black/40 border border-gray-800 rounded-2xl hover:border-red-500/30 transition-all cursor-pointer group">
                    <AlertTriangle className="text-gray-500 group-hover:text-red-500 mb-4" size={32} />
                    <h4 className="text-white font-bold text-red-400">Flush Logs</h4>
                    <p className="text-xs text-gray-500 mt-2">Permanently delete all system and access logs.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const InputGroup = ({ label, value, placeholder, type = "text", disabled = false }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest text-[10px]">{label}</label>
    <input 
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-black/40 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  </div>
);

const ToggleItem = ({ icon, title, description, active }) => (
  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-gray-800">
    <div className="p-2.5 bg-gray-800 rounded-xl text-yellow-500">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-white font-medium text-sm">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-yellow-500' : 'bg-gray-800'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
    </div>
  </div>
);

export default Settings;
