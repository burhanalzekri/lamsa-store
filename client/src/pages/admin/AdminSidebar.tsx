import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart, Settings, LogOut, X
} from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminSidebarProps {
  tab: string;
  setTab: (tab: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ tab, setTab, isOpen, setIsOpen, onLogout }: AdminSidebarProps) {
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
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed lg:static top-0 right-0 h-full w-72 bg-[#34212a] z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} flex flex-col shadow-2xl lg:shadow-none border-l border-[#C9A84C]/20`}>
        <div className="p-6 border-b border-[#C9A84C]/20 flex items-center justify-between bg-[#2a1a21]">
          <div>
            <h2 className="text-2xl font-bold text-white">لوحة لمسة</h2>
            <p className="text-xs text-[#C9A84C] mt-1">أهلاً بك في الإدارة</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-[#C9A84C] hover:text-white transition bg-white/10 p-1 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-[#C9A84C] to-[#E8C87A] text-[#34212a] shadow-lg shadow-[#C9A84C]/20 scale-[1.02]' : 'text-[#d4c5b0] hover:bg-[#482d39] hover:text-white hover:pr-5'}`}
              >
                <Icon size={20} className={isActive ? 'text-[#34212a]' : 'text-[#C9A84C]'} />
                <span className="text-[15px]">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-[#C9A84C]/20 bg-[#2a1a21]">
          <button onClick={() => { onLogout(); setLocation('/'); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-red-400 hover:text-white hover:bg-red-500/20 transition-all border border-red-500/20 hover:border-red-500/50">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
