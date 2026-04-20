
import React from 'react';

interface AvatarProps {
  name: string;
  photo?: string;
  className?: string;
}

export default function Avatar({ name, photo, className = "w-10 h-10" }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const colors = [
    'bg-gold/20 text-gold',
    'bg-blue-500/20 text-blue-400',
    'bg-green-500/20 text-green-400',
    'bg-purple-500/20 text-purple-400',
  ];
  
  // Deterministic color based on name
  const colorIndex = name.length % colors.length;

  if (photo) {
    return (
      <img 
        src={photo} 
        alt={name} 
        referrerPolicy="no-referrer"
        className={`${className} rounded-full object-cover border border-luxury-border`} 
      />
    );
  }

  return (
    <div className={`${className} ${colors[colorIndex]} rounded-full flex items-center justify-center font-bold border border-luxury-border text-[0.8em]`}>
      {initials}
    </div>
  );
}
