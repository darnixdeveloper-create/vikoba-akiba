
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppData, Member, Transaction, MzungukoItem, Settings, AppNotification } from '../types';

export const COL = {
  MEMBERS: 'members',
  HISTORIA: 'historia',
  MZUNGUKO: 'mzunguko',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications'
};

export function subscribeToData(onUpdate: (data: Partial<AppData>) => void) {
  const handleError = (error: any) => {
    console.error("Firestore Subscription Error:", error);
  };

  const unsubMembers = onSnapshot(collection(db, COL.MEMBERS), (snapshot) => {
    const members = snapshot.docs.map(doc => ({ ...doc.data() } as Member));
    onUpdate({ members });
  }, handleError);

  const unsubHistory = onSnapshot(query(collection(db, COL.HISTORIA), orderBy('date', 'desc'), limit(100)), (snapshot) => {
    const historia = snapshot.docs.map(doc => ({ ...doc.data() } as Transaction));
    onUpdate({ historia });
  }, handleError);

  const unsubMzunguko = onSnapshot(query(collection(db, COL.MZUNGUKO), orderBy('position', 'asc')), (snapshot) => {
    const mzunguko = snapshot.docs.map(doc => ({ ...doc.data() } as MzungukoItem));
    onUpdate({ mzunguko });
  }, handleError);

  const unsubSettings = onSnapshot(doc(db, COL.SETTINGS, 'config'), (snapshot) => {
    if (snapshot.exists()) {
      onUpdate({ settings: snapshot.data() as Settings });
    }
  }, handleError);

  const unsubNotifications = onSnapshot(query(collection(db, COL.NOTIFICATIONS), orderBy('timestamp', 'desc'), limit(50)), (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ ...doc.data() } as AppNotification));
    onUpdate({ notifications });
  }, handleError);

  return () => {
    unsubMembers();
    unsubHistory();
    unsubMzunguko();
    unsubSettings();
    unsubNotifications();
  };
}

export async function addMemberToCloud(member: Member) {
  await setDoc(doc(db, COL.MEMBERS, member.id), member);
}

export async function removeMemberFromCloud(id: string) {
  await deleteDoc(doc(db, COL.MEMBERS, id));
}

export async function updateMemberInCloud(id: string, updates: Partial<Member>) {
  await updateDoc(doc(db, COL.MEMBERS, id), updates);
}

export async function addTransactionToCloud(tx: Transaction) {
  await setDoc(doc(db, COL.HISTORIA, tx.id), tx);
}

export async function updateSettingsInCloud(settings: Settings) {
  await setDoc(doc(db, COL.SETTINGS, 'config'), settings);
}

export async function addNotificationToCloud(notif: AppNotification) {
  await setDoc(doc(db, COL.NOTIFICATIONS, notif.id), notif);
}

export async function updateMzungukoInCloud(items: MzungukoItem[]) {
  // Batch updates or individual
  for (const item of items) {
    await setDoc(doc(db, COL.MZUNGUKO, item.id), item);
  }
}
