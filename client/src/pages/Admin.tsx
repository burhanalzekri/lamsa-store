import { useState } from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle } from 'lucide-react';
import ProductsPanel from './admin/ProductsPanel';
import CouponsPanel from './admin/CouponsPanel';
import DiscountsPanel from './admin/DiscountsPanel';
import SettingsPanel from './admin/SettingsPanel';
import InventoryReport from './admin/InventoryReport';
import UserGuide from './admin/UserGuide';
import BulkImport from './admin/BulkImport';
import ReportsPanel from './admin/ReportsPanel';
import VariantsPanel from './admin/VariantsPanel';
import OverviewPanel from './admin/OverviewPanel';
import OrdersPanel from './admin/OrdersPanel';
import UsersPanel from './admin/UsersPanel';
import CategoriesPanel from './admin/CategoriesPanel';
import AdminSidebar from './admin/AdminSidebar';

export default function Admin({ user }: { user: any }) {
  const [tab, setTab] = useState<'overview'|'products'|'orders'|'users'|'coupons'|'settings'|'reports'|'variants'|'categories'|'discounts'|'guide'|'inventory'|'bulk-import'>('overview');
  const [, setLocation] = useLocation();

  const handleLogout = () => { 
    localStorage.removeItem('lamsa_user'); 
    localStorage.removeItem('lamsa_token'); 
    window.location.href = '/'; 
  };

  if (!user || (user.role !== "admin" && user.email !== "admin@lamsa.com")) {
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
      
      {/* القائمة الجانبية الثابتة */}
      <AdminSidebar tab={tab} setTab={setTab} onLogout={handleLogout} />

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <main className="p-3 lg:p-8 flex-1">
          {tab === 'overview' && <OverviewPanel setTab={setTab} />}
          {tab === 'products' && <ProductsPanel />}
          {tab === 'variants' && <VariantsPanel />}
          {tab === 'categories' && <CategoriesPanel />}
          {tab === 'orders' && <OrdersPanel />}
          {tab === 'users' && <UsersPanel currentUserId={user.id} />}
          {tab === 'discounts' && <DiscountsPanel />}
          {tab === 'coupons' && <CouponsPanel />}
          {tab === 'reports' && <ReportsPanel />}
          {tab === 'inventory' && <InventoryReport />}
          {tab === 'bulk-import' && <BulkImport />}
          {tab === 'settings' && <SettingsPanel />}
          {tab === 'guide' && <UserGuide />}
        </main>
      </div>

    </div>
  );
}
