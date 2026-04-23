
import React, { useMemo } from 'react';
import { AppData, Member } from '../types';
import { T } from '../constants';
import Avatar from '../components/Avatar';
import NotificationFeed from '../components/NotificationFeed';
import { 
  TrendingUp, 
  Users, 
  RotateCw, 
  CheckCircle, 
  AlertTriangle, 
  MessageCircle,
  FileText
} from 'lucide-react';

interface DashboardProps {
  data: AppData;
  user: Member;
  addToast: (msg: string, type?: any) => void;
}

export default function Dashboard({ data, user, addToast }: DashboardProps) {
  const i18n = T[data.language];
  
  const stats = useMemo(() => {
    const totalSavings = data.members.reduce((acc, m) => acc + m.contributions, 0);
    const paidCount = data.members.filter(m => m.paid).length;
    const rotationDone = data.mzunguko.filter(m => m.status === 'done').length;
    
    return {
      totalSavings,
      memberCount: data.members.length,
      paidCount,
      rotationProgress: `${rotationDone}/${data.mzunguko.length}`
    };
  }, [data]);

  const currentReceiver = useMemo(() => {
    return data.mzunguko.find(m => m.status === 'current');
  }, [data.mzunguko]);

  const unpaidMembers = useMemo(() => {
    return data.members.filter(m => !m.paid);
  }, [data.members]);

  const recentTransactions = useMemo(() => {
    return [...data.historia]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [data.historia]);

  const handleExportPDF = () => {
    addToast(data.language === 'sw' ? "Inatayarisha PDF..." : "Generating PDF...", "info");
    // Trigger actual export from parent or utility
    // We'll handle this in a specialized component or function later
    const event = new CustomEvent('generate-pdf');
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6 lg:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif italic text-luxury-text mb-1">
            {data.language === 'sw' ? 'Habari' : 'Welcome'}, {user.name.split(' ')[0]}
          </h2>
          <p className="text-luxury-text-muted text-sm capitalize">Hali ya mchango wa kikundi leo, {new Date().toLocaleDateString(data.language === 'sw' ? 'sw-TZ' : 'en-US', { day: 'numeric', month: 'long' })}</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-2 px-5 py-2 border border-gold/30 text-gold hover:bg-gold/5 transition-all text-xs uppercase tracking-widest"
        >
          {i18n.downloadPdf.toUpperCase()}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: i18n.totalSavings, value: stats.totalSavings.toLocaleString(), sub: "TZS (Mwezi huu)" },
          { label: i18n.memberCount, value: stats.memberCount, sub: "Wanawake Pekee" },
          { label: i18n.rotationProgress, value: stats.rotationProgress, sub: "Hatua ya Sasa" },
          { label: i18n.paidToday, value: `${stats.paidCount}/${stats.memberCount}`, sub: "Mchango wa Mwezi" },
        ].map((stat, i) => (
          <div key={i} className="gold-card p-5">
            <p className="text-[11px] text-luxury-text-muted uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-gold mt-1">{stat.value}</p>
            <p className="text-[10px] text-luxury-text-muted mt-2 uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Reminder Banner */}
      <div>
        {unpaidMembers.length > 0 ? (
          <div className="bg-gold/10 border-l-4 border-gold p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm">
                <span className="font-bold text-gold mr-2 uppercase text-xs">Ukumbusho:</span>
                <span className="opacity-90">
                  {unpaidMembers.map(m => m.name.split(' ')[0]).join(' na ')} {data.language === 'sw' ? 'bado hawajatuma mchango wa mwezi huu.' : "haven't sent this month's contribution yet."}
                </span>
              </p>
            </div>
            <button className="bg-gold text-luxury-dark px-3 py-1.5 rounded-[2px] font-bold text-[12px] uppercase tracking-wider hover:bg-gold/90 transition-all">
              {i18n.sendWhatsapp}
            </button>
          </div>
        ) : (
          <div className="bg-green-500/10 border-l-4 border-green-500 p-4 flex items-center gap-3">
              <p className="font-bold text-green-500 uppercase text-xs">{i18n.successMsg}</p>
          </div>
        )}
      </div>

      <div className="layout-split gap-6">
        {/* Member list */}
        <div className="gold-card p-6 h-[400px] flex flex-col overflow-hidden">
          <h3 className="text-xl font-serif italic text-luxury-text mb-4">{i18n.memberList}</h3>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {data.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="avatar w-9 h-9 rounded-full bg-[#2a2924] border border-gold flex items-center justify-center text-xs text-gold font-bold">
                    {member.photo ? <img src={member.photo} className="w-full h-full rounded-full object-cover" /> : member.name.charAt(0) + (member.name.split(' ')[1]?.[0] || '')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-luxury-text">{member.name}</p>
                    <p className="text-[10px] text-luxury-text-muted uppercase">{member.role}</p>
                  </div>
                </div>
                <span className={`chip px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  member.paid ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-500'
                }`}>
                  {member.paid ? i18n.paid : i18n.pending}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed & Rotation */}
        <div className="space-y-6">
          <NotificationFeed notifications={data.notifications} lang={data.language} />
          
          <div className="gold-card p-5">
            <h3 className="text-xl font-serif italic text-luxury-text mb-4">{i18n.receivingNow}</h3>
            {currentReceiver ? (
              <div className="flex items-center gap-4 bg-luxury-text/5 p-4 rounded">
                <div className="avatar w-12 h-12 text-lg rounded-full bg-[#2a2924] border border-gold flex items-center justify-center text-gold font-bold">
                  {currentReceiver.name.charAt(0)}
                </div>
                <div>
                  <p className="text-gold font-bold">{currentReceiver.name}</p>
                  <p className="text-xs text-luxury-text-muted">TZS {data.settings.amount.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-luxury-text-muted">N/A</p>
            )}
            <p className="text-[11px] text-luxury-text-muted mt-4 uppercase tracking-tighter">Malipo yatafanyika: Tarehe {data.settings.payDay} {new Date().toLocaleDateString(data.language === 'sw' ? 'sw-TZ' : 'en-US', { month: 'long' })}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif italic text-gold">{i18n.recentTransactions}</h3>
        <div className="gold-card overflow-x-auto p-0 border-0">
          <table className="w-full text-left">
            <thead className="bg-[#1a1916]/50 border-b border-white/5">
              <tr className="text-[11px] text-luxury-text-muted uppercase tracking-widest">
                <th className="p-4">{i18n.members}</th>
                <th className="p-4">{i18n.type}</th>
                <th className="p-4">{i18n.amount}</th>
                <th className="p-4">{i18n.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-luxury-text/5 transition-all">
                  <td className="p-4 text-sm font-medium">
                     {tx.memberName}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${
                      tx.type === 'Mchango' ? 'bg-green-500/10 text-green-400' : 'bg-gold/10 text-gold'
                    }`}>
                      {tx.type === 'Mchango' ? i18n.contribution : i18n.payout}
                    </span>
                  </td>
                  <td className={`p-4 font-bold text-sm ${tx.type === 'Mchango' ? 'text-green-400' : 'text-gold'}`}>
                    {tx.type === 'Mchango' ? '+' : '-'} TZS {tx.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs text-luxury-text-muted">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
