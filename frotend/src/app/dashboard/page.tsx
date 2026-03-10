import AIScanner from '@/components/AIScanner';
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('fanaka_user');
    if (!raw) { router.push('/'); return; }
    const user = JSON.parse(raw);
    if (user.role === 'farmer')         router.push('/dashboard/farmer');
    else if (user.role === 'consumer')  router.push('/dashboard/consumer');
    else if (user.role === 'agro_shop') router.push('/dashboard/agrovet');
    else router.push('/');
  }, []);

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#1a3a2a'}}>
      <p style={{color:'#fff',fontFamily:'sans-serif'}}>Loading your dashboard...</p>
    </div>
  );
}