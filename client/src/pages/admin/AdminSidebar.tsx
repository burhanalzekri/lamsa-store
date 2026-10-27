import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart, Settings, LogOut, Percent
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
    { id: 'categories', label: 'الفئات', icon: LayoutDashboard },
    { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
    { id: 'discounts', label: 'الخصومات', icon: Percent },
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'coupons', label: 'الكوبونات', icon: Tag },
    { id: 'reports', label: 'التقارير', icon: BarChart },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <aside className="w-40 sm:w-48 lg:w-64 bg-white flex flex-col h-full min-h-screen border-l border-[#E8C87A]/40 shadow-sm z-50 shrink-0 sticky top-0">
      {/* رأس القائمة */}
      <div className="p-3 lg:p-6 border-b border-[#E8C87A]/30 bg-[#FAF3E0]">
        <h2 className="text-sm lg:text-2xl font-bold text-[#482d39] whitespace-nowrap overflow-hidden text-ellipsis">لوحة لمسة</h2>
        <p className="text-[10px] lg:text-xs text-[#C9A84C] font-bold mt-1 hidden sm:block">الإدارة</p>
      </div>

      {/* عناصر القائمة */}
      <div className="flex-1 overflow-y-auto py-2 lg:py-4 px-1.5 lg:px-3 space-y-1 lg:space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2 lg:gap-3 px-1.5 lg:px-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl font-bold transition-all duration-200 text-xs lg:text-sm ${
                isActive 
                  ? 'bg-[#482d39] text-white shadow-md' 
                  : 'text-[#34212a] hover:bg-[#FAF3E0] hover:text-[#482d39]'
              }`}
            >
              <Icon size={16} className={`shrink-0 lg:w-5 lg:h-5 ${isActive ? 'text-[#E8C87A]' : 'text-[#C9A84C]'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* زر تسجيل الخروج */}
      <div className="p-1.5 lg:p-4 border-t border-[#E8C87A]/30 bg-[#FAF3E0]">
        <button
          onClick={() => {
            onLogout();
            setLocation('/');
          }}
          className="w-full flex items-center justify-center lg:justify-start gap-1.5 lg:gap-2 px-1.5 lg:px-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl font-bold text-[10px] lg:text-sm text-[#d93844] hover:bg-[#d93844] hover:text-white transition-all border border-[#d93844]/30"
        >
          <LogOut size={14} className="shrink-0 lg:w-5 lg:h-5" />
          <span className="truncate">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
