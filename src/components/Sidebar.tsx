
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  RefreshCcw, 
  History, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Globe 
} from 'lucide-react';
import { Page, Member } from '../types';
import { T } from '../constants';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  lang: 'sw' | 'en';
  setLang: (lang: 'sw' | 'en') => void;
  onLogout: () => void;
  user: Member;
  pendingCount: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ 
  currentPage, 
  setCurrentPage, 
  lang, 
  setLang, 
  onLogout, 
  user,
  pendingCount,
  isOpen,
  onToggle
}: SidebarProps) {
  const i18n = T[lang];

  const menuItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'Dashboard', label: i18n.dashboard, icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'Wanachama', label: i18n.members, icon: <Users className="w-5 h-5" /> },
    { id: 'Mzunguko', label: i18n.rotation, icon: <RefreshCcw className="w-5 h-5" /> },
    { id: 'Historia', label: i18n.history, icon: <History className="w-5 h-5" /> },
    { id: 'Taarifa', label: i18n.reports, icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'Profile', label: lang === 'sw' ? 'Profile Yangu' : 'My Profile', icon: <Users className="w-5 h-5" /> },
    { id: 'WhatsApp', label: i18n.whatsapp, icon: (
      <div className="relative">
        <MessageSquare className="w-5 h-5" />
        {pendingCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </div>
    ) },
    { id: 'Mipangilio', label: i18n.settings, icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onToggle}
        />
      )}

      <div className={cn(
        "flex flex-col h-full bg-luxury-gray border-r border-luxury-border w-64 fixed lg:sticky top-0 z-40 transition-transform duration-300 lg:translate-x-0 bg-gradient-to-b from-[#161512] to-luxury-dark",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="px-8 pt-8 pb-10">
        <h1 className="text-gold text-3xl font-serif italic font-bold">Akiba</h1>
        <p className="text-luxury-text-muted text-[10px] uppercase tracking-[3px] opacity-50">Upendo Group</p>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-8 py-3.5 transition-all text-sm font-medium",
                isActive 
                  ? "bg-gold/5 border-l-3 border-gold text-gold" 
                  : "border-l-3 border-transparent text-luxury-text-muted hover:text-luxury-text"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-8 py-6 border-t border-white/5 space-y-4 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium text-luxury-text truncate">{user.name}</span>
            <span className="text-[10px] uppercase text-gold truncate">{user.role}</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-[10px] uppercase font-bold text-gold cursor-pointer hover:text-gold/80 transition-colors"
          >
            {lang === 'sw' ? 'Ondoka' : 'Logout'}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-luxury-text-muted hover:text-gold transition-colors w-full"
          >
            <Globe className="w-3 h-3" />
            <span>{lang === 'sw' ? 'English' : 'Kiswahili'}</span>
          </button>
        </div>
      </div>
    </div>
  </>
);
}
