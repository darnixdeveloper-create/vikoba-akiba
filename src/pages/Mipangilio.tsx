
import React, { useState } from 'react';
import { AppData, Settings } from '../types';
import { T, DEMO_MEMBERS, DEMO_HISTORIA, DEMO_MZUNGUKO, DEMO_SETTINGS } from '../constants';
import { Save, Database, Trash2, Download, Settings as SettingsIcon, ShieldAlert, CloudUpload } from 'lucide-react';
import { updateSettingsInCloud, addMemberToCloud, addTransactionToCloud, updateMzungukoInCloud, addNotificationToCloud } from '../services/firebaseService';

interface MipangilioProps {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
  addToast: (msg: string, type?: any) => void;
  onReset: () => void;
}

export default function Mipangilio({ data, updateData, addToast, onReset }: MipangilioProps) {
  const i18n = T[data.language];
  const [form, setForm] = useState<Settings>(data.settings);

  const handleSyncToCloud = async () => {
    if (!confirm(data.language === 'sw' ? 'Hii itatuma data zako zote za sasa kwenye Cloud. Je, uendelee?' : 'This will upload all your local data to the Cloud. Continue?')) {
      return;
    }

    try {
      addToast(data.language === 'sw' ? 'Inapakia data...' : 'Uploading data...', 'info');
      await updateSettingsInCloud(data.settings);
      for (const m of data.members) await addMemberToCloud(m);
      for (const h of data.historia) await addTransactionToCloud(h);
      await updateMzungukoInCloud(data.mzunguko);
      for (const n of data.notifications) await addNotificationToCloud(n);
      addToast(data.language === 'sw' ? 'Data zote zimehamishiwa kwenye Cloud!' : 'All data synced to Cloud!', 'success');
    } catch (error) {
      addToast("Error syncing to cloud", "error");
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateData({ settings: form });
      addToast(data.language === 'sw' ? 'Mipangilio imehifadhiwa!' : 'Settings saved!');
    } catch (error) {
      addToast("Error saving settings", "error");
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'akiba-data.json';
    a.click();
    addToast(data.language === 'sw' ? 'Data imehamishwa!' : 'Data exported!', 'success');
  };

  const handleReset = () => {
    if (confirm(data.language === 'sw' ? 'Je, una Uhakika unataka kufuta data zote? Kitendo hiki hakiwezi kurudishwa.' : 'Are you sure you want to delete all data? This action cannot be undone.')) {
      localStorage.clear();
      onReset();
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-10 h-10 text-gold" />
        <h2 className="text-3xl font-serif font-bold text-luxury-text">{i18n.settings}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Group Settings */}
        <div className="space-y-6">
          <h3 className="text-gold font-serif font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            {i18n.groupSettings}
          </h3>
          
          <form onSubmit={handleSaveSettings} className="bg-luxury-gray p-8 rounded-lg border border-luxury-border gold-top-border space-y-6 shadow-2xl">
            <div>
              <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Group Name</label>
              <input 
                type="text" 
                value={form.groupName}
                onChange={e => setForm({...form, groupName: e.target.value})}
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors"
                placeholder="Vikoba Group Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Monthly Contribution</label>
                <input 
                  type="number" 
                  value={form.amount}
                  onChange={e => setForm({...form, amount: parseFloat(e.target.value)})}
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Pay Day (1-31)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="31"
                  value={form.payDay}
                  onChange={e => setForm({...form, payDay: parseInt(e.target.value)})}
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gold hover:bg-gold/90 text-luxury-dark font-bold py-4 rounded-md flex items-center justify-center gap-3 shadow-lg uppercase tracking-widest transition-all"
            >
              <Save className="w-5 h-5" />
              {i18n.saveSettings}
            </button>
          </form>
        </div>

        {/* Right: Data Management */}
        <div className="space-y-6">
          <h3 className="text-red-400 font-serif font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            {i18n.dataManagement}
          </h3>

          <div className="bg-luxury-gray p-8 rounded-lg border border-luxury-border space-y-8 shadow-2xl">
            <div className="space-y-2">
              <p className="text-luxury-text font-bold">Export Data Backup</p>
              <p className="text-sm text-luxury-text-muted leading-relaxed">Pakua data zako zote (wanachama, historia, mzunguko) kama faili ya JSON kwa usalama wa baadae.</p>
              <button 
                onClick={handleExportJSON}
                className="mt-4 flex items-center gap-2 text-gold hover:text-gold/80 transition-colors font-bold uppercase tracking-widest text-xs"
              >
                <Download className="w-4 h-4" />
                {i18n.exportData}
              </button>
            </div>

            <hr className="border-luxury-border" />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gold">
                <CloudUpload className="w-5 h-5" />
                <p className="font-bold">Sync to Cloud</p>
              </div>
              <p className="text-sm text-luxury-text-muted leading-relaxed">Hamisha data zako za sasa kwenda kwenye mfumo wa mtandaoni (Online/Cloud). Hii itakuruhusu kuona data zako kwenye browser yoyote.</p>
              <button 
                onClick={handleSyncToCloud}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 p-4 rounded-md transition-all font-bold uppercase tracking-widest text-xs"
              >
                <CloudUpload className="w-4 h-4" />
                Peleka Data Mtandaoni
              </button>
            </div>

            <hr className="border-luxury-border" />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-500">
                <ShieldAlert className="w-5 h-5" />
                <p className="font-bold">Zone ya Hatari</p>
              </div>
              <p className="text-sm text-luxury-text-muted leading-relaxed">Futa kabisa data zote za kikundi. Kitendo hiki hakiwezi kurudishwa na mfumo utarudi hali ya kwanza (Demo Data).</p>
              <button 
                onClick={handleReset}
                className="mt-4 flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-bold uppercase tracking-widest text-xs"
              >
                <Trash2 className="w-4 h-4" />
                {i18n.deleteAll}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
