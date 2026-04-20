
import React, { useState, useEffect } from 'react';
import { AppData, Member } from '../types';
import { T } from '../constants';
import { Send, MessageSquare, Edit3, User, CheckCircle } from 'lucide-react';
import Avatar from '../components/Avatar';

interface WhatsAppProps {
  data: AppData;
  lang: 'sw' | 'en';
  addToast: (msg: string, type?: any) => void;
}

type MessageType = 'reminder' | 'payment_thanks' | 'meeting' | 'monthly_report';

export default function WhatsApp({ data, lang, addToast }: WhatsAppProps) {
  const i18n = T[lang];
  const [selectedType, setSelectedType] = useState<MessageType>('reminder');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [phone, setPhone] = useState('');

  const currentReceiver = data.mzunguko.find(m => m.status === 'current');
  const paidCount = data.members.filter(m => m.paid).length;
  const totalCollected = data.members.reduce((acc, m) => acc + m.contributions, 0);

  const getMessageTemplate = (type: MessageType, member?: Member): string => {
    switch (type) {
      case 'reminder':
        return `Habari ${member?.name.split(' ')[0] || 'mwanachama'}, \n\nKumbusho la mchango wa mwezi huu wa ${data.settings.groupName}. \nKiasi: TZS ${data.settings.amount.toLocaleString()} \nMwisho wa kulipa: Tarehe ${data.settings.payDay}. \n\nAsante!`;
      case 'payment_thanks':
        return `Pongezi kwa waliolipa mwezi huu! \n\nMwezi huu mpokeaji ni ${currentReceiver?.name || 'mwanachama'}. \nKiasi cha kupokea: TZS ${(data.settings.amount * data.members.length).toLocaleString()}. \n\nVikoba cha Upendo.`;
      case 'meeting':
        return `Hujambo, nawatangazia mkutano wetu wa kila mwezi utafanyika tarehe 10 saa 10 jioni mahali petu pa kawaida. Tafadhali fika bila kukosa.`;
      case 'monthly_report':
        return `Ripoti ya Mwezi - ${data.settings.groupName}: \n\nWalio lipa: ${paidCount}/${data.members.length} \nJumla iliyokusanywa: TZS ${totalCollected.toLocaleString()} \nMzunguko: ${data.mzunguko.filter(m => m.status === 'done').length + 1}/${data.mzunguko.length} \n\nAsante kwa ushirikiano.`;
      default:
        return '';
    }
  };

  useEffect(() => {
    const member = data.members.find(m => m.id === selectedMemberId);
    setCustomMessage(getMessageTemplate(selectedType, member));
    if (member) setPhone(member.phone);
  }, [selectedType, selectedMemberId]);

  const handleSend = () => {
    if (!phone) {
      addToast(lang === 'sw' ? 'Tafadhali chagua mwanachama au weka namba' : 'Please select a member or enter a phone number', 'error');
      return;
    }
    const encodedMessage = encodeURIComponent(customMessage);
    const link = `https://wa.me/${phone.replace(/[\s+]/g, '')}?text=${encodedMessage}`;
    window.open(link, '_blank');
    addToast(lang === 'sw' ? 'Redirecting to WhatsApp...' : 'Redirecting to WhatsApp...');
  };

  return (
    <div className="space-y-6">
      <div className="bg-luxury-gray p-6 rounded-lg border border-luxury-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-gold" />
          <div>
            <h2 className="text-2xl font-serif font-bold text-luxury-text">Communication Center</h2>
            <p className="text-luxury-text-muted text-sm">Send WhatsApp updates & reminders</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Message Type Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-gold font-serif font-bold uppercase tracking-widest text-sm">{i18n.messageType}</h3>
          {[
            { id: 'reminder', label: 'Ukumbusho wa Mchango', icon: <MessageSquare /> },
            { id: 'payment_thanks', label: 'Pongezi kwa Mlipaji', icon: <CheckCircle /> },
            { id: 'meeting', label: 'Tangazo la Mkutano', icon: <User /> },
            { id: 'monthly_report', label: 'Taarifa ya Mwezi', icon: <Send /> },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as MessageType)}
              className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3 ${
                selectedType === type.id 
                  ? 'bg-gold/10 border-gold text-gold shadow-lg' 
                  : 'bg-luxury-gray border-luxury-border text-luxury-text-muted hover:bg-white/5'
              }`}
            >
              <div className={selectedType === type.id ? 'text-gold' : 'text-luxury-text-muted'}>
                {React.cloneElement(type.icon as React.ReactElement, { className: "w-5 h-5" })}
              </div>
              <span className="font-bold text-sm uppercase tracking-wider">{type.label}</span>
            </button>
          ))}

          <div className="pt-6">
             <h3 className="text-gold font-serif font-bold uppercase tracking-widest text-sm mb-4">Recipient</h3>
             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {data.members.map(member => (
                  <button 
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-md border transition-all ${
                      selectedMemberId === member.id ? 'bg-gold/20 border-gold' : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <Avatar name={member.name} photo={member.photo} className="w-8 h-8" />
                    <div className="text-left">
                      <p className="text-sm font-bold truncate">{member.name}</p>
                      <p className="text-[10px] text-luxury-text-muted">{member.phone}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Message Editor & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-luxury-gray border border-luxury-border rounded-lg overflow-hidden flex flex-col h-full gold-top-border shadow-2xl">
            <div className="p-4 bg-luxury-dark/50 border-b border-luxury-border flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-gold font-bold">Preview & Editor</span>
              <Edit3 className="w-4 h-4 text-luxury-text-muted" />
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              <div>
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Recipient Phone</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors font-mono"
                  placeholder="+255..."
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Message Content</label>
                <textarea 
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  rows={10}
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSend}
                  className="w-full py-4 bg-gold hover:bg-gold/90 text-luxury-dark font-bold rounded-md flex items-center justify-center gap-3 shadow-lg uppercase tracking-widest transition-all"
                >
                  <Send className="w-5 h-5" />
                  Tuma kupitia WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
