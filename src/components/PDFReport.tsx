
import React, { useEffect, useRef } from 'react';
import { AppData } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface PDFReportProps {
  data: AppData;
}

export default function PDFReport({ data }: PDFReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGenerate = () => {
      if (!reportRef.current) return;
      
      const opt = {
        margin: 1,
        filename: 'Akiba-Taarifa.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(reportRef.current).save();
    };

    window.addEventListener('generate-pdf', handleGenerate);
    return () => window.removeEventListener('generate-pdf', handleGenerate);
  }, [data]);

  return (
    <div className="hidden">
      <div id="pdf-report" ref={reportRef} className="bg-white text-gray-900 p-10 space-y-8 min-w-[800px]">
        {/* Header */}
        <div className="border-b-4 border-gray-900 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif font-bold uppercase">{data.settings.groupName}</h1>
            <p className="text-xl italic">Ripoti ya Maendeleo ya Kikundi</p>
          </div>
          <div className="text-right text-sm">
            <p>Tarehe: {new Date().toLocaleDateString()}</p>
            <p>Kiasi cha Mzunguko: TZS {data.settings.amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Summary Table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold border-b border-gray-300">Muhtasari wa Fedha</h2>
          <div className="grid grid-cols-3 gap-8">
             <div className="p-4 border border-gray-200">
                <p className="text-xs uppercase text-gray-500">Jumla ya Akiba</p>
                <p className="text-2xl font-bold">TZS {data.members.reduce((acc, m) => acc + m.contributions, 0).toLocaleString()}</p>
             </div>
             <div className="p-4 border border-gray-200">
                <p className="text-xs uppercase text-gray-500">Wanachama</p>
                <p className="text-2xl font-bold">{data.members.length}</p>
             </div>
             <div className="p-4 border border-gray-200">
                <p className="text-xs uppercase text-gray-500">Maendeleo ya Mzunguko</p>
                <p className="text-2xl font-bold">{data.mzunguko.filter(m => m.status === 'done').length}/{data.mzunguko.length}</p>
             </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold border-b border-gray-300">Wanachama</h2>
          <table className="w-full text-left text-sm">
             <thead>
                <tr className="bg-gray-100 uppercase text-xs font-bold">
                   <th className="p-3">Jina</th>
                   <th className="p-3">Wadhifa</th>
                   <th className="p-3">Namba ya Simu</th>
                   <th className="p-3 text-right">Akiba (TZS)</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
                {data.members.map(m => (
                  <tr key={m.id}>
                    <td className="p-3">{m.name}</td>
                    <td className="p-3">{m.role}</td>
                    <td className="p-3">{m.phone}</td>
                    <td className="p-3 text-right font-bold">{m.contributions.toLocaleString()}</td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>

        {/* History Table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold border-b border-gray-300">Historia ya Karibuni (20)</h2>
          <table className="w-full text-left text-xs">
             <thead>
                <tr className="bg-gray-100 uppercase font-bold">
                   <th className="p-2">Tarehe</th>
                   <th className="p-2">Mwanachama</th>
                   <th className="p-2">Aina</th>
                   <th className="p-2 text-right">Kiasi (TZS)</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
                {data.historia.slice().reverse().slice(0, 20).map(tx => (
                  <tr key={tx.id}>
                    <td className="p-2">{tx.date}</td>
                    <td className="p-2">{tx.memberName}</td>
                    <td className="p-2">{tx.type}</td>
                    <td className="p-2 text-right">{tx.amount.toLocaleString()}</td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>

        <div className="pt-10 text-center text-xs text-gray-500 italic">
          Ripoti hii inatolewa kiotomatiki na mfumo wa Upendo VICOBA Control. Hifadhi kwa kumbukumbu.
        </div>
      </div>
    </div>
  );
}
