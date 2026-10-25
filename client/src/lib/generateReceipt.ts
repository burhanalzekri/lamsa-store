// ============================================================
//  فاتورة فاخرة - تصميم إبداعي (الإصدار 5.0)
//  ألوان: ذهبي، وردي فاخر، بيج ناعم
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
    const W = 750;
    const rowH = 70;
    const headerH = 260;
    const footerH = 340;
    const H = headerH + (cart.length * rowH) + footerH;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // ===== خلفية متدرجة فاخرة =====
    const bgGradient = ctx.createLinearGradient(0, 0, 0, H);
    bgGradient.addColorStop(0, '#FDF8F3');
    bgGradient.addColorStop(0.5, '#FAF0E6');
    bgGradient.addColorStop(1, '#F5E6D8');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // ===== زخارف نباتية خفيفة في الزوايا =====
    drawCornerDecoration(ctx, 0, 0, 1, 1);
    drawCornerDecoration(ctx, W, 0, -1, 1);
    drawCornerDecoration(ctx, 0, H, 1, -1);
    drawCornerDecoration(ctx, W, H, -1, -1);

    // ===== إطار ذهبي مزدوج =====
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, W - 30, H - 30);

    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, W - 44, H - 44);

    // ===== الشريط العلوي الفاخر =====
    const headerGradient = ctx.createLinearGradient(0, 0, W, 140);
    headerGradient.addColorStop(0, '#482d39');
    headerGradient.addColorStop(0.5, '#6b4560');
    headerGradient.addColorStop(1, '#482d39');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(30, 30, W - 60, 130);

    // خط ذهبي تحت الشريط
    ctx.fillStyle = '#C9A84C';
    ctx.fillRect(30, 160, W - 60, 3);

    // ===== الشعار الدائري =====
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, 75, 45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // نص الشعار
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('لمسة', W / 2, 80);

    ctx.font = '11px Arial';
    ctx.fillStyle = '#C9A84C';
    ctx.fillText('L A M S A', W / 2, 103);

    // عنوان الفاتورة
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('فاتورة طلب', W / 2, 140);

    // ===== نجوم زخرفية =====
    drawStar(ctx, 60, 180, 8, 5);
    drawStar(ctx, W - 60, 180, 8, 5);

    // ===== معلومات العميل والتاريخ =====
    let y = 210;

    // صندوق معلومات العميل (مع ظل)
    drawShadowBox(ctx, 40, y - 20, W - 80, 90, 15);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#482d39';
    ctx.font = 'bold 17px Arial';
    ctx.fillText('العميل: ' + (user?.name || 'زائر'), W - 70, y + 8);

    ctx.font = '13px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('البريد: ' + (user?.email || 'غير مسجل'), W - 70, y + 35);

    ctx.textAlign = 'left';
    ctx.font = '13px Arial';
    ctx.fillStyle = '#888';
    const dateStr = new Date().toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText('التاريخ: ' + dateStr, 70, y + 8);

    const orderNum = '#' + Math.floor(100000 + Math.random() * 900000);
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#C9A84C';
    ctx.fillText('رقم الطلب: ' + orderNum, 70, y + 35);

    y += 100;

    // ===== رؤوس الأعمدة =====
    ctx.fillStyle = '#482d39';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('المنتج', W - 70, y);
    ctx.textAlign = 'center';
    ctx.fillText('الكمية', W / 2 + 50, y);
    ctx.textAlign = 'left';
    ctx.fillText('السعر', 70, y);

    // خط ذهبي تحت الرؤوس
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, y + 12);
    ctx.lineTo(W - 60, y + 12);
    ctx.stroke();

    y += 45;

    // ===== صفوف المنتجات =====
    cart.forEach((item: any, idx: number) => {
      if (idx % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.roundRect(45, y - 28, W - 90, rowH - 8, 10);
        ctx.fill();
      }

      // اسم المنتج
      ctx.fillStyle = '#34212a';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'right';
      const name = item.name.length > 28 ? item.name.substring(0, 28) + '...' : item.name;
      ctx.fillText(name, W - 70, y);

      // تفاصيل
      ctx.font = '12px Arial';
      ctx.fillStyle = '#999';
      ctx.fillText('المقاس: ' + (item.size || '-') + '   |   اللون: ' + (item.color || '-'), W - 70, y + 24);

      // الكمية في دائرة ذهبية
      ctx.fillStyle = '#C9A84C';
      ctx.beginPath();
      ctx.arc(W / 2 + 50, y + 5, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(String(item.quantity), W / 2 + 50, y + 11);

      // السعر
      ctx.textAlign = 'left';
      ctx.fillStyle = '#d93844';
      ctx.font = 'bold 17px Arial';
      ctx.fillText((item.price * item.quantity).toLocaleString() + ' ر.ي', 70, y + 5);

      y += rowH;
    });

    // خط فاصل ذهبي
    y += 20;
    ctx.strokeStyle = 'rgba(201,168,76,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(W - 60, y);
    ctx.stroke();

    y += 35;

    // ===== المجاميع =====
    ctx.textAlign = 'right';
    ctx.font = '15px Arial';
    ctx.fillStyle = '#777';
    ctx.fillText('المجموع الفرعي:', W - 250, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#34212a';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(subtotal.toLocaleString() + ' ر.ي', 70, y);

    y += 32;

    ctx.textAlign = 'right';
    ctx.font = '15px Arial';
    ctx.fillStyle = '#777';
    ctx.fillText('الشحن:', W - 250, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#16a34a';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('مجاني', 70, y);

    y += 32;

    if (discountPercent > 0) {
      ctx.textAlign = 'right';
      ctx.font = '15px Arial';
      ctx.fillStyle = '#16a34a';
      ctx.fillText('الخصم (' + discountPercent + '%):', W - 250, y);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 15px Arial';
      ctx.fillText('-' + discountAmount.toLocaleString() + ' ر.ي', 70, y);
      y += 32;
    }

    // ===== صندوق الإجمالي الفاخر =====
    y += 15;
    const totalY = y;

    // ظل
    ctx.fillStyle = 'rgba(72,45,57,0.1)';
    ctx.beginPath();
    ctx.roundRect(50, totalY + 5, W - 100, 85, 20);
    ctx.fill();

    // صندوق متدرج
    const totalGrad = ctx.createLinearGradient(50, 0, W - 50, 0);
    totalGrad.addColorStop(0, '#482d39');
    totalGrad.addColorStop(0.5, '#6b4560');
    totalGrad.addColorStop(1, '#482d39');
    ctx.fillStyle = totalGrad;
    ctx.beginPath();
    ctx.roundRect(45, totalY, W - 90, 85, 20);
    ctx.fill();

    // إطار ذهبي
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(45, totalY, W - 90, 85, 20);
    ctx.stroke();

    // نص الإجمالي
    ctx.textAlign = 'right';
    ctx.font = 'bold 26px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('الإجمالي:', W - 100, totalY + 52);

    ctx.textAlign = 'left';
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#E8C87A';
    ctx.fillText(total.toLocaleString() + ' ر.ي', 85, totalY + 55);

    y = totalY + 110;

    // ===== شارة "تم الطلب" =====
    ctx.fillStyle = 'rgba(201,168,76,0.15)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 110, y, 220, 45, 22);
    ctx.fill();

    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 110, y, 220, 45, 22);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C9A84C';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('✓ تم استلام طلبك بنجاح', W / 2, y + 28);

    y += 70;

    // ===== تذييل =====
    // خط ذهبي
    ctx.strokeStyle = 'rgba(201,168,76,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, y);
    ctx.lineTo(W - 150, y);
    ctx.stroke();

    // نجمة صغيرة في المنتصف
    drawStar(ctx, W / 2, y, 6, 4);

    y += 30;

    ctx.textAlign = 'center';
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#482d39';
    ctx.fillText('شكراً لتسوقكم معنا 💕', W / 2, y);

    y += 30;
    ctx.font = '13px Arial';
    ctx.fillStyle = '#999';
    ctx.fillText('للتواصل والاستفسار: 775799926', W / 2, y);

    y += 22;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#bbb';
    ctx.fillText('lamsa-store.onrender.com', W / 2, y);

    // ===== الشريط السفلي =====
    ctx.fillStyle = '#482d39';
    ctx.fillRect(30, H - 45, W - 60, 30);
    ctx.fillStyle = '#C9A84C';
    ctx.fillRect(30, H - 45, W - 60, 2);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E8C87A';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('الدفع عند الاستلام  •  متجر لمسة  •  جودة تستحقها', W / 2, H - 25);

    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('generateReceiptImage error:', e);
    return null;
  }
}

// ===== دوال مساعدة =====

function drawCornerDecoration(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(201,168,76,0.2)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + dx * (40 + i * 20), y + dy * (40 + i * 20), 30 + i * 15, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number, points: number) {
  const inner = outer / 2.5;
  ctx.save();
  ctx.fillStyle = '#C9A84C';
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawShadowBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  // ظل
  ctx.save();
  ctx.fillStyle = 'rgba(72,45,57,0.08)';
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 4, w, h, r);
  ctx.fill();
  ctx.restore();

  // الصندوق
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();

  // إطار ذهبي رفيع
  ctx.strokeStyle = 'rgba(201,168,76,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
}

// دعم roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  } as any;
}
