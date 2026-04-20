
import React, { useState } from 'react';
import { AppData, Transaction, Member, AppNotification } from '../types';
import { T } from '../constants';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { PlusCircle, Search, Filter, Calendar, FileDown } from 'lucide-react';
import { addTransactionToCloud, addNotificationToCloud, updateMemberInCloud } from '../services/firebaseService';

interface HistoriaProps {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
  addToast: (msg: string, type?: any) => void;
  user: Member;
}

export default function Historia({ data, updateData, addToast, user }: HistoriaProps) {
  const i18n = T[data.language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState(data.settings.amount.toString());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'Mchango' | 'Malipo'>('Mchango');

  const filteredHistory = data.historia
    .filter(tx => tx.memberName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMemberId) return;

    const member = data.members.find(m => m.id === selectedMemberId);
    if (!member) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      memberId: selectedMemberId,
      memberName: member.name,
      type,
      amount: parseFloat(amount),
      date,
      notes
    };

    const newNotification: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      senderName: user.name,
      message: type === 'Mchango' 
        ? `${member.name} ameweka TZS ${parseFloat(amount).toLocaleString()}`
        : `${member.name} amepokea TZS ${parseFloat(amount).toLocaleString()}`,
      timestamp: new Date().toISOString(),
      type: 'payment',
      read: false
    };

    try {
      const updatedMembers = data.members.map(m => {
        if (m.id === selectedMemberId) {
          return {
            ...m,
            contributions: type === 'Mchango' ? m.contributions + parseFloat(amount) : m.contributions,
            paid: type === 'Mchango' ? true : m.paid
          };
        }
        return m;
      });

      updateData({
        historia: [newTx, ...data.historia],
        notifications: [newNotification, ...data.notifications],
        members: updatedMembers
      });

      addToast(data.language === 'sw' ? "Mchakato umekamilika!" : "Process completed!");
      setIsModalOpen(false);
      
      // Reset form
      setSelectedMemberId('');
      setAmount(data.settings.amount.toString());
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    } catch (error) {
      addToast("Error recording contribution", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-luxury-text">{i18n.history}</h2>
          <p className="text-luxury-text-muted">{data.historia.length} total transactions</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-luxury-dark px-6 py-2 rounded-md font-bold transition-all shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            {i18n.makeContribution}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-text-muted" />
          <input 
            type="text"
            placeholder={data.language === 'sw' ? "Tafuta mwanachama..." : "Search member..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-luxury-gray border border-luxury-border rounded-md pl-10 pr-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-luxury-gray border border-luxury-border rounded-md text-luxury-text-muted hover:text-luxury-text">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      <div className="bg-luxury-gray border border-luxury-border rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-luxury-dark/50 border-b border-luxury-border">
              <tr className="text-xs text-luxury-text-muted uppercase tracking-widest">
                <th className="p-4">{i18n.members}</th>
                <th className="p-4">{i18n.type}</th>
                <th className="p-4">{i18n.amount}</th>
                <th className="p-4">{i18n.date}</th>
                <th className="p-4">{i18n.notes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {filteredHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-all group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <Avatar name={tx.memberName} className="w-6 h-6 border-none" />
                       <span className="font-medium">{tx.memberName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tx.type === 'Mchango' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gold/10 text-gold border border-gold/20'
                    }`}>
                      {tx.type === 'Mchango' ? i18n.contribution : i18n.payout}
                    </span>
                  </td>
                  <td className={`p-4 font-bold ${tx.type === 'Mchango' ? 'text-green-400' : 'text-gold'}`}>
                    {tx.type === 'Mchango' ? '+' : '-'} {tx.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-luxury-text-muted">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {tx.date}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-luxury-text-muted italic max-w-xs truncate">
                    {tx.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={i18n.makeContribution}
      >
        <form onSubmit={handleAddContribution} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Member</label>
              <select 
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                required
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors"
              >
                <option value="">Select Member</option>
                {data.members.sort((a,b) => a.name.localeCompare(b.name)).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.paid ? 'Paid' : 'Pending'})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Type</label>
                <select 
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="Mchango">{i18n.contribution}</option>
                  <option value="Malipo">{i18n.payout}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Amount (TZS)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors" 
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Notes</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Jan mchango, Penalty, etc..."
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors resize-none" 
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gold hover:bg-gold/90 text-luxury-dark font-bold py-4 rounded-md transition-all uppercase tracking-widest shadow-lg"
          >
            Hifadhi Miamala
          </button>
        </form>
      </Modal>
    </div>
  );
}
