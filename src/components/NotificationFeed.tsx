
import React from 'react';
import { AppNotification } from '../types';
import { Bell, Info, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';

interface NotificationFeedProps {
  notifications: AppNotification[];
  lang: 'sw' | 'en';
}

export default function NotificationFeed({ notifications, lang }: NotificationFeedProps) {
  if (notifications.length === 0) {
    return (
      <div className="bg-luxury-gray border border-luxury-border p-6 rounded-lg text-center">
        <Bell className="w-8 h-8 text-luxury-text-muted mx-auto mb-2 opacity-20" />
        <p className="text-luxury-text-muted text-sm italic">
          {lang === 'sw' ? 'Hakuna taarifa mpya' : 'No new notifications'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-luxury-gray border border-luxury-border rounded-lg overflow-hidden flex flex-col max-h-[400px]">
      <div className="p-4 border-b border-luxury-border bg-luxury-dark/30 flex items-center justify-between">
        <h3 className="font-serif italic text-gold flex items-center gap-2">
          <Bell className="w-4 h-4" />
          {lang === 'sw' ? 'Taarifa za Kikundi' : 'Group Notifications'}
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-luxury-text-muted">Live Feed</span>
      </div>
      <div className="overflow-y-auto divide-y divide-white/5 custom-scrollbar">
        {notifications.map((notif) => (
          <div key={notif.id} className={cn(
             "p-4 transition-all hover:bg-white/5",
             !notif.read && "border-l-2 border-l-gold"
          )}>
            <div className="flex gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                notif.type === 'payment' ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
              )}>
                {notif.type === 'payment' ? <CreditCard className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-luxury-text leading-tight">{notif.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-gold uppercase">{notif.senderName}</span>
                  <span className="text-[10px] text-luxury-text-muted">
                    {new Date(notif.timestamp).toLocaleTimeString(lang === 'sw' ? 'sw-TZ' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
