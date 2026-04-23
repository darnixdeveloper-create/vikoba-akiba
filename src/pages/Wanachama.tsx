
import React, { useState } from 'react';
import { AppData, Member, Role, MzungukoItem } from '../types';
import { T } from '../constants';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { UserPlus, Camera, Trash2, Phone, ShieldCheck } from 'lucide-react';
import { fileToBase64 } from '../lib/storage';
import { addMemberToCloud, removeMemberFromCloud, updateMzungukoInCloud } from '../services/firebaseService';

interface WanachamaProps {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
  addToast: (msg: string, type?: any) => void;
  user: Member;
}

export default function Wanachama({ data, updateData, addToast, user }: WanachamaProps) {
  const i18n = T[data.language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('Mwanachama');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('1234');
  const [photo, setPhoto] = useState<string | undefined>();
  const [initialContributions, setInitialContributions] = useState('0');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setPhoto(base64);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setRole('Mwanachama');
    setEmail('');
    setPass('1234');
    setPhoto(undefined);
    setInitialContributions('0');
    setEditingMemberId(null);
  };

  const handleEditClick = (member: Member) => {
    setEditingMemberId(member.id);
    setName(member.name);
    setPhone(member.phone);
    setRole(member.role);
    setEmail(member.email || '');
    setPass(member.pass);
    setPhoto(member.photo);
    setInitialContributions(member.contributions.toString());
    setIsModalOpen(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user.isAdmin) {
      addToast(data.language === 'sw' ? "Ni Mwenyekiti tu anaweza kuongeza wanachama" : "Only Admin can add members", "error");
      return;
    }

    if (editingMemberId) {
      const updatedMembers = data.members.map(m => {
        if (m.id === editingMemberId) {
          return {
            ...m,
            name,
            phone,
            role,
            email: email || undefined,
            pass,
            photo,
            isAdmin: role === 'Mwenyekiti',
            contributions: parseFloat(initialContributions) || 0
          };
        }
        return m;
      });

      updateData({ members: updatedMembers });
      addToast(data.language === 'sw' ? "Taarifa zimesahihishwa!" : "Member updated!");
    } else {
      const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      const newMember: Member = {
        id: newId,
        name,
        role,
        phone,
        paid: false,
        pass,
        email: email || undefined,
        isAdmin: role === 'Mwenyekiti',
        photo,
        contributions: parseFloat(initialContributions) || 0,
        mustChangePassword: true
      };

      // Add to mzunguko as waiting
      const newMzungukoId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      const newMzungukoItem: MzungukoItem = {
        id: newMzungukoId,
        memberId: newId,
        name: name.split(' ')[0],
        month: 'Pending',
        status: 'waiting' as const,
        position: data.mzunguko.length + 1
      };

      updateData({
        members: [...data.members, newMember],
        mzunguko: [...data.mzunguko, newMzungukoItem]
      });
      addToast(data.language === 'sw' ? "Mwanachama ameongezwa!" : "Member added!");
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleRemoveMember = async () => {
    if (!user.isAdmin || !memberToRemove) return;
    
    if (memberToRemove === user.id) {
      addToast(data.language === 'sw' ? "Huwezi kujiondoa mwenyewe!" : "You cannot remove yourself!", "error");
      setMemberToRemove(null);
      return;
    }

    try {
      updateData({
        members: data.members.filter(m => m.id !== memberToRemove)
      });
      addToast(data.language === 'sw' ? "Mwanachama ameondolewa!" : "Member removed!");
      setMemberToRemove(null);
    } catch (error) {
       addToast("Error removing member", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-luxury-text">{i18n.members}</h2>
          <p className="text-luxury-text-muted">{data.members.length} {i18n.memberCount}</p>
        </div>
        {user.isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-luxury-dark px-6 py-2 rounded-md font-bold transition-all shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            {i18n.addMember}
          </button>
        )}
      </div>

      <div className="bg-luxury-gray border border-luxury-border rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-luxury-dark/50 border-b border-luxury-border">
              <tr className="text-xs text-luxury-text-muted uppercase tracking-widest">
                <th className="p-4">{i18n.members}</th>
                <th className="p-4">{i18n.phone}</th>
                <th className="p-4">Total TZS</th>
                <th className="p-4">{i18n.status}</th>
                {user.isAdmin && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {data.members.map((member) => (
                <tr key={member.id} className="hover:bg-luxury-text/5 transition-all">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} photo={member.photo} />
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-luxury-text">{member.name}</p>
                          {member.isAdmin && <ShieldCheck className="w-4 h-4 text-gold" />}
                        </div>
                        <p className="text-xs text-luxury-text-muted">
                          {member.role === 'Mwenyekiti' && i18n.roleChairperson}
                          {member.role === 'Mhazini' && i18n.roleTreasurer}
                          {member.role === 'Katibu' && i18n.roleSecretary}
                          {member.role === 'Mwanachama' && i18n.roleMember}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-luxury-text-muted text-sm">
                      <Phone className="w-3 h-3" />
                      {member.phone}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-luxury-text">
                    {member.contributions.toLocaleString()}
                  </td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        member.paid ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {member.paid ? i18n.paid : i18n.pending}
                      </span>
                  </td>
                  {user.isAdmin && (
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(member)}
                          className="p-2 text-gold hover:bg-gold/10 rounded-md transition-all font-bold text-xs uppercase"
                        >
                          Edit
                        </button>
                        {member.id !== user.id && (
                          <button 
                            onClick={() => setMemberToRemove(member.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                            title={i18n.removeMember}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title={i18n.removeMember}
      >
        <div className="space-y-6 text-center">
          <p className="text-luxury-text py-4">{i18n.confirmRemove}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setMemberToRemove(null)}
              className="flex-1 px-4 py-3 border border-luxury-border rounded-md text-luxury-text hover:bg-luxury-text/5 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              {data.language === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button 
              onClick={handleRemoveMember}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors font-bold uppercase tracking-widest text-xs shadow-lg"
            >
              {i18n.removeMember}
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); resetForm(); }} 
        title={editingMemberId ? (data.language === 'sw' ? 'Sahihisha Mwanachama' : 'Edit Member') : i18n.addMember}
      >
        <form onSubmit={handleAddMember} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-luxury-dark border-2 border-luxury-border flex items-center justify-center overflow-hidden transition-all group-hover:border-gold">
                {photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-luxury-text-muted group-hover:text-gold transition-colors">
                    <Camera className="w-10 h-10" />
                    <span className="text-[10px] uppercase font-bold tracking-tight">{i18n.uploadPhoto}</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="absolute bottom-1 right-1 bg-gold p-2 rounded-full text-luxury-dark shadow-lg transform group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            {photo && (
              <button 
                type="button" 
                onClick={() => setPhoto(undefined)}
                className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                {i18n.removePhoto}
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">{i18n.memberName}</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">{i18n.phone}</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Email Address (Optional)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="mfano@gmail.com"
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">Jumla ya Akiba (TZS)</label>
                <input 
                  type="number" 
                  value={initialContributions}
                  onChange={e => setInitialContributions(e.target.value)}
                  placeholder="350000"
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">{i18n.type}</label>
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors"
                >
                  <option value="Mwanachama">{i18n.roleMember}</option>
                  <option value="Mwenyekiti">{i18n.roleChairperson}</option>
                  <option value="Mhazini">{i18n.roleTreasurer}</option>
                  <option value="Katibu">{i18n.roleSecretary}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-luxury-text-muted mb-2">{i18n.loginPassword}</label>
                <input 
                  type="password" 
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  required
                  className="w-full bg-luxury-dark border border-luxury-border rounded-md px-4 py-3 text-luxury-text focus:outline-none focus:border-gold transition-colors" 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gold hover:bg-gold/90 text-luxury-dark font-bold py-4 rounded-md transition-all uppercase tracking-widest shadow-lg"
          >
            {editingMemberId ? (data.language === 'sw' ? 'Hifadhi Marekebisho' : 'Save Changes') : i18n.addMember}
          </button>
        </form>
      </Modal>
    </div>
  );
}
