import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Package, AlertTriangle, Menu, X } from 'lucide-react';
import ProductsPanel from './admin/ProductsPanel';
import CouponsPanel from './admin/CouponsPanel';
import SettingsPanel from './admin/SettingsPanel';
import ReportsPanel from './admin/ReportsPanel';
import VariantsPanel from './admin/VariantsPanel';
import OverviewPanel from './admin/OverviewPanel';
import OrdersPanel from './admin/OrdersPanel';
import UsersPanel from './admin/UsersPanel';
import AdminSidebar from './admin/AdminSidebar';

export default function Admin({ user }: { user: any }) {
  const [tab, setTab] = useState<'overview'|'products'|'orders'|'users'|'coupons'|'settings'|'reports'|'variants'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogout = () => { 
    localStorage.removeItem('lamsa_user'); 
    localStorage.removeItem('lamsa_token'); 
    window.location.href = '/'; 
  };

  // التحقق من صلاحية المستخدم (اختياري)
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0]">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#482d39] mb-2">غير مصرح لك</h2>
          <p className="text-gray-600 mb-6">هذه الصفحة مخصصة للمسؤولين فقط.</p>
          <button onClick={() => setLocation('/')} className="bg-[#482d39] text-white px-6 py-2 rounded-lg font-bold">العودة للمتجر</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAF3E0]" dir="rtl" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      
      {/* القائمة الجانبية للكمبيوتر */}
      <div className="hidden lg:block">
        <AdminSidebar tab={tab} setTab={setTab} onLogout={handleLogout} />
      </div>

      {/* القائمة الجانبية للجوال */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-64 h-full bg-[#34212a] shadow-2xl">
            <div className="absolute top-4 left-4 z-10">
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#C9A84C] hover:text-white bg-white/10 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            <AdminSidebar tab={tab} setTab={(t) => { setTab(t); setIsMobileMenuOpen(false); }} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <div className="lg:hidden bg-white p-4 flex items-center justify-between border-b shadow-sm sticky top-0 z-30">
          <h1 className="font-bold text-[#482d39] text-lg">لوحة لمسة</h1>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-[#FAF3E0] text-[#482d39] rounded-lg">
            <Menu size={24} />
          </button>
        </div>

        <main className="p-4 lg:p-8 flex-1">
          {tab === 'overview' && <OverviewPanel />}
          {tab === 'products' && <ProductsPanel />}
          {tab === 'variants' && <VariantsPanel />}
          {tab === 'orders' && <OrdersPanel />}
          {tab === 'users' && <UsersPanel currentUserId={user.id} />}
          {tab === 'coupons' && <CouponsPanel />}
          {tab === 'reports' && <ReportsPanel />}
          {tab === 'settings' && <SettingsPanel />}
        </main>
      </div>

    </div>
  );
}
