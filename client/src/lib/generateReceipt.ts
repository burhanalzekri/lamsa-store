// ============================================================
//  دالة إنشاء صورة الفاتورة باستخدام Canvas API
//  لا تحتاج لصور المنتجات - تعمل 100% في جميع المتصفحات
//  الإصدار: 3.0 (نهائي)
// ============================================================

export function generateReceiptImage(
  cart: any[],
  subtotal: number,
  discountPercent: number,
  discountAmount: number,
  total: number,
  user: any
): string | null {
  try {
    const W = 700;
    const rowH = 56;
    const headerH = 170;
    const footerH = 260;
    const H = headerH + (cart.length * rowH) + footerH;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // خلفية
    ctx.fillStyle = '#FAF3E0';
    ctx.fillRect(0, 0, W, H);

    // شريط علوي
    ctx.fillStyle = '#482d39';
    ctx.fillRect(0, 0, W, 110);

    // عنوان المتجر
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('متجر لمسة', W / 2, 52);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#e8d5c4';
    ctx.fillText('Lamsa Store - فاتورة طلب', W / 2, 85);

    // بيانات العميل
    ctx.textAlign = 'right';
    ctx.fillStyle = '#34212a';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('العميل: ' + (user?.name || 'زائر'), W - 40, 145);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('البريد: ' + (user?.email || 'غير مسجل'), W - 40, 170);

    // التاريخ
    ctx.textAlign = 'left';
    ctx.fillStyle = '#666';
    ctx.font = '13px Arial';
    const dateStr = new Date().toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText('التاريخ: ' + dateStr, 40, 170);

    // خط فاصل
    ctx.strokeStyle = '#d4c5b0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 190);
    ctx.lineTo(W - 40, 190);
    ctx.stroke();

    // رؤوس الأعمدة
    let y = 220;
    ctx.fillStyle = '#482d39';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('المنتج', W - 40, y);
    ctx.textAlign = 'center';
    ctx.fillText('الكمية', W / 2 + 30, y);
    ctx.textAlign = 'left';
    ctx.fillText('السعر', 40, y);

    // خط تحت الرؤوس
    ctx.strokeStyle = '#482d39';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, y + 10);
    ctx.lineTo(W - 40, y + 10);
    ctx.stroke();

    y += 35;

    // صفوف المنتجات
    cart.forEach((item: any, idx: number) => {
      if (idx % 2 === 0) {
        ctx.fillStyle = '#f5ede1';
        ctx.fillRect(30, y - 22, W - 60, rowH - 6);
      }

      ctx.fillStyle = '#34212a';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      const name = item.name.length > 28 ? item.name.substring(0, 28) + '...' : item.name;
      ctx.fillText(name, W - 40, y);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#777';
      ctx.fillText((item.color || '-') + ' | ' + (item.size || '-'), W - 40, y + 18);

      ctx.fillStyle = '#34212a';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(String(item.quantity), W / 2 + 30, y + 5);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#d93844';
      ctx.font = 'bold 14px Arial';
      ctx.fillText((item.price * item.quantity).toLocaleString() + ' ر.ي', 40, y + 5);

      y += rowH;
    });

    // خط فاصل
    y += 10;
    ctx.strokeStyle = '#d4c5b0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(W - 40, y);
    ctx.stroke();

    y += 40;

    // المجموع الفرعي
    ctx.textAlign = 'right';
    ctx.font = '15px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('المجموع الفرعي:', W - 200, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#34212a';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(subtotal.toLocaleString() + ' ر.ي', 40, y);

    y += 32;

    // الشحن
    ctx.textAlign = 'right';
    ctx.font = '15px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('الشحن:', W - 200, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#16a34a';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('مجاني', 40, y);

    y += 32;

    // الخصم
    if (discountPercent > 0) {
      ctx.textAlign = 'right';
      ctx.font = '15px Arial';
      ctx.fillStyle = '#16a34a';
      ctx.fillText('الخصم (' + discountPercent + '%):', W - 200, y);
      ctx.textAlign = 'left';
      ctx.font = 'bold 15px Arial';
      ctx.fillText('-' + discountAmount.toLocaleString() + ' ر.ي', 40, y);
      y += 32;
    }

    // خط فاصل قبل الإجمالي
    ctx.strokeStyle = '#482d39';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(W - 40, y);
    ctx.stroke();

    y += 40;

    // الإجمالي النهائي
    ctx.textAlign = 'right';
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#482d39';
    ctx.fillText('الإجمالي:', W - 200, y);
    ctx.textAlign = 'left';
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#d93844';
    ctx.fillText(total.toLocaleString() + ' ر.ي', 40, y);

    y += 50;

    // تذييل
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('شكراً لتسوقكم معنا! 💕', W / 2, y);
    y += 25;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText('الدفع عند الاستلام - للاستفسار: 775799926', W / 2, y);

    // شريط سفلي
    ctx.fillStyle = '#482d39';
    ctx.fillRect(0, H - 30, W, 30);
    ctx.fillStyle = '#e8d5c4';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('lamsa-store.onrender.com', W / 2, H - 10);

    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('generateReceiptImage error:', e);
    return null;
  }
}
