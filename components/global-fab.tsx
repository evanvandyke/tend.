'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FAB } from '@/components/fab';
import { QuickAddSheet } from '@/components/quick-add-sheet';

function GlobalFAB() {
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <FAB onClick={() => setQuickAddOpen(true)} />
      <QuickAddSheet
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAdd={() => router.refresh()}
      />
    </>
  );
}

export { GlobalFAB };
