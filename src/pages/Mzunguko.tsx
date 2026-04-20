
import React from 'react';
import { AppData } from '../types';
import { T } from '../constants';
import { Flame, CheckCircle, Clock, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface MzungukoProps {
  data: AppData;
  lang: 'sw' | 'en';
}

export default function Mzunguko({ data, lang }: MzungukoProps) {
  const i18n = T[lang];

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-luxury-text mb-2">{i18n.rotationGrid}</h2>
        <p className="text-luxury-text-muted">{i18n.rotationProgress}: {data.mzunguko.filter(m => m.status === 'done').length}/{data.mzunguko.length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.mzunguko.sort((a, b) => a.position - b.position).map((item) => (
          <div 
            key={item.id}
            className={cn(
              "p-6 rounded-lg border transition-all relative overflow-hidden",
              item.status === 'current' 
                ? "bg-gold/5 border-gold shadow-[0_0_20px_rgba(201,168,76,0.1)] scale-105 z-10" 
                : item.status === 'done'
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-luxury-gray border-luxury-border opacity-60"
            )}
          >
            {item.status === 'current' && (
              <div className="absolute top-0 right-0 bg-gold text-luxury-dark text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <Flame className="w-3 h-3 fill-current" />
                {i18n.now.toUpperCase()}
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "w-12 h-12 flex items-center justify-center rounded-full text-2xl font-serif font-bold border",
                item.status === 'current' ? "border-gold text-gold" : "border-luxury-border text-luxury-text-muted"
              )}>
                {item.position}
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-luxury-text-muted">{item.month}</p>
                <p className={cn(
                  "text-sm font-bold mt-1",
                  item.status === 'current' ? "text-gold" : item.status === 'done' ? "text-green-400" : "text-luxury-text-muted"
                )}>
                  {item.status === 'current' ? i18n.now : item.status === 'done' ? i18n.received : i18n.waiting}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xl font-serif font-bold text-luxury-text">{item.name}</p>
              <p className="text-luxury-text-muted text-sm">TZS {data.settings.amount.toLocaleString()}</p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {item.status === 'done' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {item.status === 'waiting' && <Clock className="w-4 h-4 text-luxury-text-muted" />}
              <div className={cn(
                "h-1 flex-1 rounded-full",
                item.status === 'done' ? "bg-green-400" : item.status === 'current' ? "bg-gold" : "bg-luxury-border"
              )} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-luxury-gray p-8 rounded-lg border border-luxury-border">
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-6 h-6 text-gold" />
          <h3 className="text-2xl font-serif font-bold text-luxury-text">{i18n.rules}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[i18n.rule1, i18n.rule2, i18n.rule3, i18n.rule4].map((rule, i) => (
            <div key={i} className="p-4 bg-luxury-dark/50 rounded-md border border-luxury-border text-luxury-text-muted text-sm leading-relaxed">
              {rule}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
