
import React, { useState } from 'react';
import { Member, AppData } from '../types';
import { T } from '../constants';
import { Camera, Save, Phone, User, Mail, Lock, Trash2 } from 'lucide-react';
import { fileToBase64 } from '../lib/storage';
import { updateMemberInCloud } from '../services/firebaseService';

interface ProfileProps {
  user: Member;
  data: AppData;
  lang: 'sw' | 'en';
  addToast: (msg: string, type?: any) => void;
  updateData: (newData: Partial<AppData>) => void;
  setCurrentPage: (page: any) => void;
}

export default function Profile({ user, data, lang, addToast, updateData, setCurrentPage }: ProfileProps) {
  const i18n = T[lang];
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email || '');
  const [pass, setPass] = useState(user.pass);
  const [photo, setPhoto] = useState(user.photo);
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setPhoto(base64);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updates: Partial<Member> = {
      name,
      phone,
      email: email || undefined,
      pass,
      photo,
      mustChangePassword: false
    };

    try {
      const updatedMembers = data.members.map(m => {
        if (m.id === user.id) {
          return { ...m, ...updates };
        }
        return m;
      });

      updateData({
        members: updatedMembers
      });
      
      addToast(lang === 'sw' ? "Profile imesahihishwa!" : "Profile updated!", "success");
    } catch (error) {
      console.error(error);
      addToast(lang === 'sw' ? "Imeshindwa kusahihisha profile" : "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div className="bg-luxury-gray border border-luxury-border rounded-lg overflow-hidden shadow-2xl p-8 gold-top-border">
        {user.mustChangePassword && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm text-center font-bold animate-pulse">
            {lang === 'sw' 
              ? "Tafadhali badilisha neno lako la siri la sasa ili kuendelea kutumia mfumo." 
              : "Please change your temporary password to continue using the system."}
          </div>
        )}
        <div className="flex flex-col items-center mb-10">
           <div className="relative group mb-6">
              <div className="w-40 h-40 rounded-full bg-luxury-dark border-4 border-luxury-border flex items-center justify-center overflow-hidden transition-all group-hover:border-gold shadow-2xl">
                {photo ? (
                  <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-luxury-text-muted group-hover:text-gold transition-colors">
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="absolute bottom-2 right-2 bg-gold p-3 rounded-full text-luxury-dark shadow-xl transform group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            
            <h2 className="text-2xl font-serif font-bold text-luxury-text">{user.name}</h2>
            <span className="text-gold uppercase tracking-widest text-xs font-bold mt-1">
              {user.role === 'Mwenyekiti' && i18n.roleChairperson}
              {user.role === 'Mhazini' && i18n.roleTreasurer}
              {user.role === 'Katibu' && i18n.roleSecretary}
              {user.role === 'Mwanachama' && i18n.roleMember}
            </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-luxury-text-muted">
                <User className="w-3 h-3 text-gold" />
                {i18n.memberName}
              </label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-luxury-text-muted">
                <Phone className="w-3 h-3 text-gold" />
                {i18n.phone}
              </label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-luxury-text-muted">
                <Mail className="w-3 h-3 text-gold" />
                Email (Required for Sync)
              </label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mfano@gmail.com"
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-luxury-text-muted">
                <Lock className="w-3 h-3 text-gold" />
                {i18n.loginPassword}
              </label>
              <input 
                type="password" 
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-all" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-luxury-border flex gap-4">
             {photo && (
              <button 
                type="button" 
                onClick={() => setPhoto(undefined)}
                className="px-6 py-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-md transition-all font-bold uppercase tracking-widest text-xs flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {i18n.removePhoto}
              </button>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-gold hover:bg-gold/90 text-luxury-dark font-bold py-4 rounded-md transition-all uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Processing...' : (lang === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes')}
            </button>
          </div>
        </form>

        {!user.mustChangePassword && (
          <div className="mt-8 pt-8 border-t border-luxury-border flex justify-center">
            <button 
              onClick={() => setCurrentPage('Dashboard')}
              className="flex items-center gap-2 text-gold hover:text-gold/80 transition-all font-bold uppercase tracking-[0.2em] text-xs group"
            >
              <span>{lang === 'sw' ? 'Endelea kwenye Dashboard' : 'Continue to Dashboard'}</span>
              <Save className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-gold/5 border border-gold/20 p-6 rounded-lg text-center">
        <p className="text-luxury-text-muted text-sm italic">
          {lang === 'sw' 
            ? "Angalizo: Ili uweze kusawazisha data zako na akaunti ya Google, hakikisha Email uliyoweka hapa inafanana na ile unayoitumia kuingia." 
            : "Note: To sync your data with Google, ensure the Email provided here matches the one you use to sign in."}
        </p>
      </div>
    </div>
  );
}
