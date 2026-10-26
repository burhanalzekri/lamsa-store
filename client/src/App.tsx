import { lazy, Suspense, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalFeedback from "./components/GlobalFeedback";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import ThankYou from "./pages/ThankYou";
import ProductDetails from "./pages/ProductDetails";
import Track from "./pages/Track";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import { LogOut, Menu, X, ShoppingBag, Home as HomeIcon, Truck, User, LayoutDashboard, Search, Flame, Tag, Clock, Heart, Info, Bell } from "lucide-react";
import LuxuryLogo from './components/LuxuryLogo';

const Admin = lazy(() => import("./pages/Admin"));
const CART_KEY = "lamsa-cart-v2";

function AppContent() {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('lamsa_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [sideSearch, setSideSearch] = useState("");
  const [sideFilter, setSideFilter] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    } catch (e) { setCartCount(0); }
  };

  useEffect(() => {
    const token = localStorage.getItem('lamsa_token');
    const savedUser = localStorage.getItem('lamsa_user');
    if (token && savedUser) { try { setUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem("lamsa_user"); localStorage.removeItem("lamsa_token"); } }
    
    updateCartCount();
    fetch('/api/notifications').then(r => r.json()).then(d => { if(Array.isArray(d)) setNotifications(d); }).catch(() => {});

    window.addEventListener('storage', updateCartCount);
    const interval = setInterval(updateCartCount, 1000);
    return () => { window.removeEventListener('storage', updateCartCount); clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      fetch('/api/products?t=' + Date.now())
        .then(r => r.json())
        .then(d => { if(Array.isArray(d)) setProducts(d); })
        .catch(() => {});
    }
  }, [menuOpen]);

  const handleLogout = () => {
    setUser(null); localStorage.removeItem('lamsa_user'); localStorage.removeItem('lamsa_token'); setLocation('/'); window.location.reload();
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name?.includes(sideSearch);
    if (sideFilter === "discount") return matchSearch && p.compareAtHalalas > 0;
    if (sideFilter === "best") return matchSearch && p.badge?.includes('مبيع');
    if (sideFilter === "new") return matchSearch;
    return matchSearch;
  });

  return (
    <>
      <nav className="bg-white border-b shadow-sm p-3 flex justify-between items-center sticky top-0 z-[60]" dir="rtl">
        <button onClick={() => setMenuOpen(true)} className="p-2 text-[#482d39]"><Menu size={24}/></button>
        <div className="cursor-pointer scale-90" onClick={() => setLocation('/')}><LuxuryLogo size="sm" /></div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 text-[#482d39]">
            <Bell size={24} />
            {notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{notifications.length}</span>}
          </button>
          <button onClick={() => setLocation('/cart')} className="relative p-2 text-[#482d39]">
            <ShoppingBag size={24} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#d93844] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {showNotif && (
        <div className="fixed top-16 right-4 left-4 md:left-auto md:w-80 bg-white shadow-2xl rounded-xl border border-gray-100 z-[65] p-4" dir="rtl">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <h3 className="font-bold text-[#482d39]">الإشعارات ({notifications.length})</h3>
            <button onClick={() => setShowNotif(false)} className="text-gray-400"><X size={16}/></button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">لا توجد إشعارات</p>
            ) : notifications.map((n, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded-lg border text-sm">
                <p className="font-bold text-[#34212a]">{n.title}</p>
                <p className="text-xs text-gray-500">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[70]" onClick={() => setMenuOpen(false)}>
          <aside className="w-80 bg-white h-full flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center bg-[#482d39] text-white">
              <h2 className="text-xl font-bold">مرحباً {user?.name || 'بك'}</h2>
              <button onClick={() => setMenuOpen(false)}><X size={24}/></button>
            </div>

            <div className="grid grid-cols-5 gap-1 p-3 border-b bg-gray-50">
              <button onClick={() => { setLocation('/'); setMenuOpen(false); }} className="flex flex-col items-center gap-1 text-gray-700 hover:text-[#482d39]">
                <div className="bg-white p-2 rounded-full shadow-sm"><HomeIcon size={18}/></div>
                <span className="text-[9px] font-bold">الرئيسية</span>
              </button>
              <button onClick={() => { setLocation('/cart'); setMenuOpen(false); }} className="flex flex-col items-center gap-1 text-gray-700 hover:text-[#482d39]">
                <div className="bg-white p-2 rounded-full shadow-sm relative">
                  <ShoppingBag size={18}/>
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#d93844] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
                </div>
                <span className="text-[9px] font-bold">السلة</span>
              </button>
              <button onClick={() => { setLocation('/track'); setMenuOpen(false); }} className="flex flex-col items-center gap-1 text-gray-700 hover:text-[#482d39]">
                <div className="bg-white p-2 rounded-full shadow-sm"><Truck size={18}/></div>
                <span className="text-[9px] font-bold">تتبع</span>
              </button>
              <button onClick={() => { setLocation('/wishlist'); setMenuOpen(false); }} className="flex flex-col items-center gap-1 text-gray-700 hover:text-[#482d39]">
                <div className="bg-white p-2 rounded-full shadow-sm"><Heart size={18}/></div>
                <span className="text-[9px] font-bold">المفضلة</span>
              </button>
              <button onClick={() => { setLocation(user ? '/profile' : '/login'); setMenuOpen(false); }} className="flex flex-col items-center gap-1 text-gray-700 hover:text-[#482d39]">
                <div className="bg-white p-2 rounded-full shadow-sm"><User size={18}/></div>
                <span className="text-[9px] font-bold">حسابي</span>
              </button>
            </div>

            <div className="p-3 border-b bg-white">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                <input value={sideSearch} onChange={e => setSideSearch(e.target.value)} placeholder="ابحثي في القائمة..." className="w-full bg-gray-100 rounded-lg py-2 pr-9 pl-3 text-sm outline-none focus:ring-2 focus:ring-[#482d39]" />
              </div>
            </div>

            <div className="flex gap-2 p-3 overflow-x-auto border-b bg-white" style={{scrollbarWidth: 'none'}}>
              <button onClick={() => setSideFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${sideFilter === 'all' ? 'bg-[#482d39] text-white' : 'bg-gray-100'}`}>الكل</button>
              <button onClick={() => setSideFilter('discount')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 ${sideFilter === 'discount' ? 'bg-[#482d39] text-white' : 'bg-gray-100'}`}><Tag size={12}/> عروض</button>
              <button onClick={() => setSideFilter('best')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 ${sideFilter === 'best' ? 'bg-[#482d39] text-white' : 'bg-gray-100'}`}><Flame size={12}/> مبيعاً</button>
              <button onClick={() => setSideFilter('new')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 ${sideFilter === 'new' ? 'bg-[#482d39] text-white' : 'bg-gray-100'}`}><Clock size={12}/> جديد</button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-10">لا توجد نتائج.</p>
              ) : filteredProducts.map(p => (
                <div key={p.id} onClick={() => { setMenuOpen(false); setLocation(`/product/${p.id}`); }} className="flex gap-3 items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-200">
                  <img src={p.image || "https://placehold.co/100"} className="w-12 h-14 object-cover rounded shadow-sm" />
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{p.name}</h4>
                    <p className="text-[#d93844] text-sm font-bold">{p.price} ر.ي</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4 bg-gray-50">
              {user ? (
                <div className="space-y-2">
                  {user.role === 'admin' && (
                    <button onClick={() => { setLocation('/admin'); setMenuOpen(false); }} className="w-full flex items-center gap-2 p-2 text-sm text-amber-700 font-bold bg-amber-100 rounded-lg">
                      <LayoutDashboard size={16}/> لوحة التحكم
                    </button>
                  )}
                  <button onClick={() => { setLocation('/about'); setMenuOpen(false); }} className="w-full flex items-center gap-2 p-2 text-sm text-[#482d39] font-bold hover:bg-gray-100 rounded-lg">
                    <Info size={16}/> من نحن / اتصل بنا
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 text-sm text-red-600 font-bold hover:bg-red-50 rounded-lg">
                    <LogOut size={16}/> تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => { setLocation('/about'); setMenuOpen(false); }} className="w-full flex items-center gap-2 p-2 text-sm text-[#482d39] font-bold hover:bg-gray-100 rounded-lg">
                    <Info size={16}/> من نحن / اتصل بنا
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setLocation('/login'); setMenuOpen(false); }} className="flex-1 bg-[#482d39] text-white py-2 rounded-lg text-sm font-bold">دخول</button>
                    <button onClick={() => { setLocation('/register'); setMenuOpen(false); }} className="flex-1 border border-[#482d39] text-[#482d39] py-2 rounded-lg text-sm font-bold">حساب جديد</button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      <div onClick={() => setLocation('/cart')} className="fixed bottom-6 right-6 z-[60] bg-[#482d39] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:bg-[#654151] transition-all hover:scale-110">
        <ShoppingBag size={28} />
        {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#d93844] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}
      </div>

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login"><Login onLogin={(u:any,t:string)=>{setUser(u);localStorage.setItem('lamsa_user',JSON.stringify(u));localStorage.setItem('lamsa_token',t);setLocation(u?.role === 'admin' || u?.email === 'admin@lamsa.com' ? '/admin' : '/');}} goToRegister={() => setLocation('/register')} /></Route>
        <Route path="/register"><Register onLogin={(u:any,t:string)=>{setUser(u);localStorage.setItem('lamsa_user',JSON.stringify(u));localStorage.setItem('lamsa_token',t);setLocation('/');}} goToLogin={() => setLocation('/login')} /></Route>
        <Route path="/cart" component={Cart} />
        <Route path="/thank-you" component={ThankYou} />
        <Route path="/product/:id" component={ProductDetails} />
        <Route path="/track" component={Track} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/profile" component={Profile} />
        <Route path="/about" component={About} />
        <Route path="/faq" component={FAQ} />
              <Route path="/admin">
          {() => {
            if (!user) { setLocation('/login'); return null; }
            if (user.role !== 'admin') return <div className="p-10 text-center font-bold text-red-600" dir="rtl">⛔ غير مصرح لك بالدخول إلى لوحة الإدارة.</div>;
            return <Suspense fallback={<div className="p-10 text-center" dir="rtl">جارٍ فتح مساحة الإدارة…</div>}><Admin user={user} /></Suspense>;
          }}
        </Route>
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" />
          <GlobalFeedback />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
