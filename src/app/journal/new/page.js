'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import JournalEditor from '@/components/JournalEditor';

export default function NewJournalEntryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-sanctuary-sage border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <JournalEditor 
      onClose={() => router.push('/journal')}
    />
  );
}
