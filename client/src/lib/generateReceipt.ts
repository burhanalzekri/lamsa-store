export const generateReceiptImage = (cart: any[], subtotal: number, discount: number, discountAmount: number, total: number, user: any): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const width = 800;
  const padding = 40;
  const headerHeight = 160;
  const itemHeight = 90;
  const footerHeight = 250;
  const height = headerHeight + (cart.length * itemHeight) + footerHeight + padding * 2;

  canvas.width = width;
  canvas.height = height;

  // الخلفية
  ctx.fillStyle = '#FAF3E0';
  ctx.fillRect(0, 0, width, height);

  // الترويسة (برقوقي)
  ctx.fillStyle = '#482d39';
  ctx.fillRect(0, 0, width, headerHeight);

  // شعار ونص المتجر
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('لمسة', width / 2, 75);
  
  ctx.font = '20px Arial';
  ctx.fillStyle = '#F5B7B1';
  ctx.fillText('LAMSA STORE', width / 2, 110);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px Arial';
  ctx.fillText('تفاصيل الطلب', width / 2, 140);

  // خط فاصل
  ctx.strokeStyle = '#e0d6c8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, headerHeight + 20);
  ctx.lineTo(width - padding, headerHeight + 20);
  ctx.stroke();

  // المنتجات
  let y = headerHeight + 60;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#482d39';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('المنتجات:', width - padding, y);
  y += 40;

  cart.forEach((item, index) => {
    // رقم المنتج (دائرة)
    ctx.fillStyle = '#F5B7B1';
    ctx.beginPath();
    ctx.arc(width - padding - 10, y - 8, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#482d39';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText((index + 1).toString(), width - padding - 10, y - 2);

    // اسم المنتج
    ctx.textAlign = 'right';
    ctx.fillStyle = '#34212a';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(item.name, width - padding - 40, y);
    
    // السعر (على اليسار)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#d93844';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`${(item.price * item.quantity).toLocaleString()} ر.ي`, padding, y);
    
    y += 28;
    
    // التفاصيل (المقاس، اللون، الكمية)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#888';
    ctx.font = '15px Arial';
    ctx.fillText(`المقاس: ${item.size || '-'}  |  اللون: ${item.color || '-'}  |  الكمية: ${item.quantity}`, width - padding - 40, y);
    
    y += 45;
  });

  // خط فاصل
  y += 10;
  ctx.strokeStyle = '#e0d6c8';
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  y += 40;

  // المجاميع
  ctx.textAlign = 'right';
  ctx.fillStyle = '#34212a';
  ctx.font = '20px Arial';
  ctx.fillText('المجموع:', width - padding, y);
  ctx.textAlign = 'left';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`${subtotal.toLocaleString()} ر.ي`, padding, y);
  y += 35;

  if (discount > 0) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#16a34a';
    ctx.font = '20px Arial';
    ctx.fillText(`الخصم (${discount}%):`, width - padding, y);
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`-${discountAmount.toLocaleString()} ر.ي`, padding, y);
    y += 35;
  }

  // الإجمالي (بخلفية ملونة)
  y += 10;
  ctx.fillStyle = '#482d39';
  ctx.fillRect(padding, y - 20, width - padding * 2, 60);
  
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('الإجمالي:', width - padding - 10, y + 20);
  
  ctx.textAlign = 'left';
  ctx.font = 'bold 26px Arial';
  ctx.fillText(`${total.toLocaleString()} ر.ي`, padding + 10, y + 20);
  
  y += 80;

  // التذييل (معلومات العميل)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#888';
  ctx.font = '16px Arial';
  ctx.fillText(`العميل: ${user?.name || 'زائر'}  |  ${user?.email || 'غير مسجل'}`, width / 2, y);
  y += 25;
  ctx.fillText('شكراً لثقتك بلمسة!', width / 2, y);
  y += 25;
  ctx.fillStyle = '#482d39';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('للاستفسار: +967 775 799 926', width / 2, y);

  return canvas.toDataURL('image/png');
};
