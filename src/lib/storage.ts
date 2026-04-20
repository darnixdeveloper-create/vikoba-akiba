
import { AppData, Member, Transaction, MzungukoItem, Settings } from '../types';
import { DEMO_MEMBERS, DEMO_HISTORIA, DEMO_MZUNGUKO, DEMO_SETTINGS } from '../constants';

const KEYS = {
  MEMBERS: 'ak_members',
  HISTORIA: 'ak_historia',
  MZUNGUKO: 'ak_mzunguko',
  SETTINGS: 'ak_settings',
  NOTIFICATIONS: 'ak_notifications',
  LANGUAGE: 'ak_lang',
  USER: 'ak_current_user'
};

export function saveToStorage(data: Partial<AppData> & { currentUser?: Member | null }) {
  if (data.members) localStorage.setItem(KEYS.MEMBERS, JSON.stringify(data.members));
  if (data.historia) localStorage.setItem(KEYS.HISTORIA, JSON.stringify(data.historia));
  if (data.mzunguko) localStorage.setItem(KEYS.MZUNGUKO, JSON.stringify(data.mzunguko));
  if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
  if (data.notifications) localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
  if (data.language) localStorage.setItem(KEYS.LANGUAGE, data.language);
  if (data.currentUser !== undefined) {
    if (data.currentUser) localStorage.setItem(KEYS.USER, JSON.stringify(data.currentUser));
    else localStorage.removeItem(KEYS.USER);
  }
}

export function loadCurrentUser(): Member | null {
  const user = localStorage.getItem(KEYS.USER);
  return user ? JSON.parse(user) : null;
}

export function loadFromStorage(): AppData {
  const members = localStorage.getItem(KEYS.MEMBERS);
  const historia = localStorage.getItem(KEYS.HISTORIA);
  const mzunguko = localStorage.getItem(KEYS.MZUNGUKO);
  const settings = localStorage.getItem(KEYS.SETTINGS);
  const notifications = localStorage.getItem(KEYS.NOTIFICATIONS);
  const language = localStorage.getItem(KEYS.LANGUAGE) as 'sw' | 'en' | null;

  return {
    members: members ? JSON.parse(members) : DEMO_MEMBERS,
    historia: historia ? JSON.parse(historia) : DEMO_HISTORIA,
    mzunguko: mzunguko ? JSON.parse(mzunguko) : DEMO_MZUNGUKO,
    settings: settings ? JSON.parse(settings) : DEMO_SETTINGS,
    notifications: notifications ? JSON.parse(notifications) : [],
    language: language || 'sw'
  };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
