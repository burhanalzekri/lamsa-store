import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart, Settings, LogOut
} from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminSidebarProps {
  tab: string;
  setTab: (tab: any) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ tab, setTab, onLogout }: AdminSidebarProps) {
  const [, setLocation] = useLocation();

  const menuItems = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'variants', label: 'المتغيرات', icon: Tag },
    { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'coupons', label: 'الكوبونات', icon: Tag },
    { id: 'reports', label: 'التقارير', icon: BarChart },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#34212a] flex flex-col h-screen sticky top-0 shrink-0 border-l border-[#C9A84C]/20 z-50">
      {/* رأس القائمة */}
      <div className="p-5 border-b border-[#C9A84C]/20 bg-[#2a1a21]">
        <h2 className="text-xl font-bold text-white">لوحة لمسة</h2>
        <p className="text-xs text-[#C9A84C] mt-1">الإدارة</p>
      </div>

      {/* عناصر القائمة */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold transition-all duration-200 text-sm ${
                isActive 
                  ? 'bg-gradient-to-r from-[#C9A84C] to-[#E8C87A] text-[#34212a] shadow-md' 
                  : 'text-[#d4c5b0] hover:bg-[#482d39] hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#34212a]' : 'text-[#C9A84C]'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* زر تسجيل الخروج */}
      <div className="p-3 border-t border-[#C9A84C]/20 bg-[#2a1a21]">
        <button
          onClick={() => {
            onLogout();
            setLocation('/');
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-bold text-red-400 hover:text-white hover:bg-red-500/20 transition-all border border-red-500/20 text-sm"
        >
          <LogOut size={18} />
          <span>خروج</span>
        </button>
      </div>
    </aside>
  );
}
