import { useState, useEffect } from 'react';

export interface Settings {
  storeName: string;
  currency: string;
  phone: string;
  email: string;
  address: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    storeName: 'لمسة',
    currency: 'ر.ي',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(prev => ({ ...prev, ...data }));
      })
      .catch(console.error);
  }, []);

  return settings;
}
