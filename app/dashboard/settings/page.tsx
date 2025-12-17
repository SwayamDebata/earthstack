'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Bell, Database, Globe, Lock, Save, Server, Shield, Smartphone, User, Wifi } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Data Sources', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 relative overflow-y-auto bg-black/40">
           <div className="max-w-5xl mx-auto p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Settings</h1>
                        <p className="text-gray-400 mt-1">Manage platform configuration and data preferences</p>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-600 active:scale-95 transition-all rounded-lg font-medium text-white shadow-lg shadow-blue-500/20"
                    >
                        {saveStatus === 'saving' ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : saveStatus === 'saved' ? (
                            <>
                                <div className="text-green-300">✓</div>
                                Saved
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                <div className="flex gap-8">
                    {/* Settings Navigation */}
                    <div className="w-64 shrink-0 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <tab.icon size={18} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 space-y-6"
                    >
                        {activeTab === 'general' && (
                            <div className="glass-card p-6 rounded-2xl space-y-8">
                                <section className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Globe size={20} className="text-blue-400" />
                                        Regional Preferences
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Default Region</label>
                                            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors">
                                                <option>Odisha, India (Mahanadi Basin)</option>
                                                <option>California, USA (Napa Valley)</option>
                                                <option>Rotterdam, Netherlands</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Timezone</label>
                                            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors">
                                                <option>Asia/Kolkata (IST)</option>
                                                <option>America/Los_Angeles (PST)</option>
                                                <option>Europe/Amsterdam (CET)</option>
                                                <option>UTC (Coordinated Universal Time)</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-white/5" />

                                <section className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <MonitorSettingIcon />
                                        Display Settings
                                    </h3>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div>
                                            <div className="font-medium">High Fidelity Rendering</div>
                                            <div className="text-sm text-gray-400">Enable advanced 3D terrain and particle effects</div>
                                        </div>
                                        <ToggleSwitch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div>
                                            <div className="font-medium">Command Mode Auto-Launch</div>
                                            <div className="text-sm text-gray-400">Enter grid layout automatically on high alert</div>
                                        </div>
                                        <ToggleSwitch />
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="glass-card p-6 rounded-2xl space-y-6">
                                <section className="space-y-4">
                                    <h3 className="text-lg font-semibold mb-4">Alert Channels</h3>
                                    
                                    {[
                                        { label: 'Push Notifications (Mobile App)', icon: Smartphone, desc: 'Receive critical alerts on iOS/Android' },
                                        { label: 'SMS Broadcast', icon: MessageSquareIcon, desc: 'Send text alerts to registered citizen numbers' },
                                        { label: 'Email Reports', icon: MailIcon, desc: 'Daily risk assessment summaries' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <item.icon size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{item.label}</div>
                                                    <div className="text-sm text-gray-400">{item.desc}</div>
                                                </div>
                                            </div>
                                            <ToggleSwitch defaultChecked={i === 0} />
                                        </div>
                                    ))}
                                </section>
                            </div>
                        )}

                        {activeTab === 'integrations' && (
                           <div className="glass-card p-6 rounded-2xl space-y-6">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4 items-start">
                                    <Server className="text-blue-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-blue-100">Satellite Uplink Active</h4>
                                        <p className="text-sm text-blue-200/60 mt-1">
                                            Connected to Sentinel-2 and Landsat-9 streams via EarthStack API Relay. 
                                            Latency: <span className="font-mono text-white">14ms</span>
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 text-xs font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        LIVE
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-semibold pt-4">Connected Sensors</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { name: 'USGS River Gauges', status: 'operational', count: 1240 },
                                        { name: 'IMD Weather Stations', status: 'operational', count: 85 },
                                        { name: 'Private IoT Network', status: 'degraded', count: 42 },
                                        { name: 'Copernicus DEM', status: 'operational', count: 'Global' },
                                    ].map((source, idx) => (
                                        <div key={idx} className="p-4 border border-white/10 rounded-xl bg-black/20 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-200">{source.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{source.count} Data Points</div>
                                            </div>
                                            <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                                source.status === 'operational' 
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            }`}>
                                                {source.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                           </div>
                        )}

                        {activeTab === 'security' && (
                             <div className="glass-card p-6 rounded-2xl space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Lock size={20} className="text-red-400" />
                                        Access Control
                                    </h3>
                                    <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-red-200">Emergency Override Key</span>
                                            <button className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition-colors">
                                                Regenerate
                                            </button>
                                        </div>
                                        <code className="block bg-black/40 p-3 rounded font-mono text-xs text-gray-400 break-all">
                                            sk_live_51M3m9...x29A
                                        </code>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Used for automated government broadcast triggers via API. Keep this secret.
                                        </p>
                                    </div>
                                </div>
                             </div>
                        )}
                    </motion.div>
                </div>
           </div>
        </main>
      </div>
    </div>
  );
}

// Sub-components for cleaner file
function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <button 
            onClick={() => setChecked(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? 'bg-primary' : 'bg-gray-700'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    );
}

// Icons
import { Mail as MailIcon, MessageSquare as MessageSquareIcon, Monitor as MonitorSettingIcon } from 'lucide-react';
