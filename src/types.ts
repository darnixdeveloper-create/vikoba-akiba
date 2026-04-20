
export type Role = 'Mwenyekiti' | 'Mhazini' | 'Katibu' | 'Mwanachama';

export interface Member {
  id: string;
  name: string;
  role: Role;
  phone: string;
  paid: boolean;
  pass: string;
  isAdmin: boolean;
  email?: string;
  photo?: string; // base64
  contributions: number;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: 'Mchango' | 'Malipo';
  amount: number;
  date: string;
  notes: string;
}

export interface MzungukoItem {
  id: string;
  memberId: string;
  name: string;
  month: string;
  status: 'done' | 'current' | 'waiting';
  position: number;
}

export interface Settings {
  groupName: string;
  amount: number;
  payDay: number;
}

export interface AppNotification {
  id: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'payment' | 'system';
  read: boolean;
}

export interface AppData {
  members: Member[];
  historia: Transaction[];
  mzunguko: MzungukoItem[];
  settings: Settings;
  language: 'sw' | 'en';
  notifications: AppNotification[];
}

export type Page = 'Dashboard' | 'Wanachama' | 'Mzunguko' | 'Historia' | 'Taarifa' | 'WhatsApp' | 'Mipangilio' | 'Profile';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
