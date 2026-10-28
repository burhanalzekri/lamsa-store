import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function useOrderNotifications(user: any) {
  const [lastOrderCount, setLastOrderCount] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const permissionRequested = useRef(false);

  // إنشاء عنصر الصوت (مرة واحدة)
  useEffect(() => {
    // صوت بسيط (يمكنك استبداله بملف mp3 من /public/sounds/notification.mp3)
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audioRef.current.volume = 0.6;
  }, []);

  // طلب إذن الإشعارات من المتصفح
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    if (permissionRequested.current) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
      permissionRequested.current = true;
    }
  }, [user]);

  // مراقبة الطلبات الجديدة (كل 30 ثانية)
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const checkOrders = async () => {
      try {
        const token = localStorage.getItem('lamsa_token');
        const res = await fetch('/api/admin/all-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;

        const orders = await res.json();
        const currentCount = Array.isArray(orders) ? orders.length : 0;

        // أول مرة: نحفظ العدد فقط
        if (lastOrderCount === null) {
          setLastOrderCount(currentCount);
          return;
        }

        // إذا زاد العدد → طلب جديد!
        if (currentCount > lastOrderCount) {
          const diff = currentCount - lastOrderCount;
          const latestOrder = orders[0];

          // 1. تشغيل الصوت (بعد أول نقرة من المستخدم — المتصفح قد يمنعه)
          try {
            await audioRef.current?.play();
          } catch (e) {
            // المتصفح منع الصوت (يحتاج تفاعل) — لا مشكلة
          }

          // 2. إشعار Toast
          toast.success(`🔔 ${diff} طلب جديد!`, {
            description: `${latestOrder?.customerName || 'عميل'} - ${Number(latestOrder?.totalAmount || 0).toLocaleString()} ر.ي`,
            duration: 10000,
          });

          // 3. إشعار المتصفح (إذا كان الإذن ممنوحاً)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 طلب جديد في لمسة!', {
              body: `${latestOrder?.customerName || 'عميل'} - ${Number(latestOrder?.totalAmount || 0).toLocaleString()} ر.ي`,
              icon: '/icon-192.png',
              tag: 'new-order',
            });
          }

          // 4. تحديث العدد
          setLastOrderCount(currentCount);
        } else if (currentCount < lastOrderCount) {
          // انخفض العدد (حذف طلب) → نحدّث فقط
          setLastOrderCount(currentCount);
        }
      } catch (e) {
        // تجاهل أخطاء الشبكة
      }
    };

    // فحص فوري ثم كل 30 ثانية
    checkOrders();
    const interval = setInterval(checkOrders, 30000);
    return () => clearInterval(interval);
  }, [user, lastOrderCount]);
}
