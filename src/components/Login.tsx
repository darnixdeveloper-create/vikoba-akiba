
import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Member, Settings } from '../types';
import { T, THEMES } from '../constants';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LoginProps {
  members: Member[];
  onLogin: (user: Member) => void;
  lang: 'sw' | 'en';
  settings: Settings;
}

export default function Login({ members, onLogin, lang, settings }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const i18n = T[lang];

  const currentTheme = THEMES.find(t => t.id === settings.theme);
  const themeClass = currentTheme ? currentTheme.class : 'bg-luxury-dark';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Match by full name or first name to be flexible
    const user = members.find(
      (m) => (m.name.toLowerCase() === username.toLowerCase() || m.name.split(' ')[0].toLowerCase() === username.toLowerCase()) && m.pass === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError(lang === 'sw' ? 'Jina au neno la siri limekosewa' : 'Invalid username or password');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      
      // Check if user exists in members collection by email
      const existingMember = members.find(m => m.email === userEmail);
      if (existingMember) {
        onLogin(existingMember);
      } else {
        setError(lang === 'sw' ? 'Email hii haijaunganishwa na mwanachama yeyote. Omba Mwenyekiti akuongezee email yako.' : 'This email is not linked to any member. Ask the Admin to add your email.');
      }
    } catch (err: any) {
      console.error(err);
      setError(lang === 'sw' ? 'Imeshindwa kuingia na Google' : 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={cn("min-h-screen flex items-center justify-center relative p-4 transition-colors duration-700", themeClass)}
      style={settings.customBackground ? {
        backgroundImage: `url(${settings.customBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      <div className={cn("grain-overlay", settings.theme === 'white' && "opacity-0")} />
      {settings.customBackground && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      )}
      
      <div className="w-full max-w-md bg-luxury-gray gold-top-border rounded-lg shadow-2xl p-8 relative z-10 luxury-glass">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gold mb-2">Upendo VICOBA</h1>
          <p className="text-luxury-text-muted text-sm">{i18n.login}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">
              {i18n.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors"
              placeholder="e.g. fatuma"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">
              {i18n.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors"
              placeholder="••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-gold hover:bg-gold/90 text-luxury-dark font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {i18n.login.toUpperCase()}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-luxury-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-luxury-gray px-2 text-luxury-text-muted">OR</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-white/90 text-black font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            {loading ? 'Processing...' : 'Sign in with Google'}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
           <button 
             onClick={() => { localStorage.clear(); window.location.reload(); }}
             className="text-[10px] uppercase tracking-widest text-luxury-text-muted hover:text-gold transition-colors"
           >
             Huwezi kuingia? Bonyeza hapa kurekebisha mfumo
           </button>
        </div>
      </div>
    </div>
  );
}
