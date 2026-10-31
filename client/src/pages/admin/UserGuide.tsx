import { useState } from 'react';
import { BookOpen, Package, ShoppingCart, Users, Tag, BarChart, Settings, Percent, FolderTree, Gift, TrendingUp, LogIn, UserPlus, Search, Heart, CreditCard, Truck, CheckCircle, AlertTriangle, Star, MapPin, Printer, ArrowRight, Home, Phone, Mail, X, ChevronDown, PlayCircle } from 'lucide-react';
import { useLocation } from 'wouter';

export default function UserGuide() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('all');

  const sections = [
    { id: 'register', title: 'التسجيل', icon: UserPlus, color: 'blue', desc: 'إنشاء حساب جديد' },
    { id: 'login', title: 'الدخول', icon: LogIn, color: 'purple', desc: 'تسجيل الدخول' },
    { id: 'shopping', title: 'التسوق', icon: Search, color: 'amber', desc: 'البحث والتصفح' },
    { id: 'cart', title: 'السلة', icon: ShoppingCart, color: 'orange', desc: 'إدارة السلة' },
    { id: 'checkout', title: 'الدفع', icon: CreditCard, color: 'teal', desc: 'إتمام الطلب' },
    { id: 'track', title: 'التتبع', icon: Truck, color: 'indigo', desc: 'متابعة الطلب' },
    { id: 'account', title: 'الحساب', icon: Users, color: 'purple', desc: 'بياناتي وطلباتي' },
    { id: 'wishlist', title: 'المفضلة', icon: Heart, color: 'red', desc: 'حفظ المنتجات' },
    { id: 'admin', title: 'لوحة التحكم', icon: Settings, color: 'gray', desc: 'للمدير فقط' },
    { id: 'tips', title: 'نصائح', icon: AlertTriangle, color: 'yellow', desc: 'نصائح مهمة' },
  ];

  const filtered = sections.filter(s => 
    search === '' || s.title.includes(search) || s.desc.includes(search)
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const colorMap: any = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-200 text-gray-700',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] py-8" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">

        {/* العنوان */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#C9A84C] to-[#b8952f] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <BookOpen size={48} className="text-white"/>
          </div>
          <h1 className="text-4xl font-bold text-[#2a1a21] mb-2" style={{ fontFamily: "'Amiri', serif" }}>دليل استخدام متجر لمسة</h1>
          <p className="text-gray-600 text-lg">كل ما تحتاجه من التسجيل حتى إتمام الطلب</p>
        </div>

        {/* زر طباعة */}
        <div className="flex justify-center gap-3 mb-8">
          <button onClick={() => window.print()} className="bg-white border-2 border-[#2a1a21] text-[#2a1a21] px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#2a1a21] hover:text-white transition">
            <Printer size={18}/> طباعة الدليل
          </button>
          <button onClick={() => setLocation('/')} className="bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all">
            <Home size={18}/> العودة للمتجر
          </button>
        </div>

        {/* البحث + الفهرس */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
          <div className="relative mb-6">
            <Search className="absolute right-4 top-3.5 text-gray-400" size={20}/>
            <input 
              placeholder="ابحث عن قسم... (مثال: التسجيل، السلة)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 pr-12 pl-4 text-lg focus:border-[#C9A84C] outline-none transition"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {filtered.map(s => {
              const Icon = s.icon;
              return (
                <button 
                  key={s.id} 
                  onClick={() => scrollToSection(s.id)}
                  className="group p-4 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-[#C9A84C] rounded-xl transition-all hover:shadow-lg text-center"
                >
                  <div className={`w-12 h-12 ${colorMap[s.color]} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon size={24}/>
                  </div>
                  <p className="font-bold text-sm text-[#2a1a21]">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                لا توجد نتائج مطابقة لبحثك
              </div>
            )}
          </div>
        </div>

        {/* المحتوى */}
        <div className="space-y-6">

          {/* 1. التسجيل */}
          <section id="register" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-blue-100 p-3 rounded-xl"><UserPlus className="text-blue-600" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">1. إنشاء حساب جديد</h2>
                <p className="text-sm text-gray-500">ابدأ رحلتك في المتجر</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                'افتح المتجر من الرابط: lamsa-store.onrender.com',
                'اضغط على القائمة الجانبية (☰) في الزاوية العلوية',
                'اختر "حساب جديد" أو اذهب إلى /register',
                'املأ البيانات: الاسم الكامل، البريد الإلكتروني، كلمة المرور',
                'اضغط "إنشاء حساب"',
                'سيتم تسجيل الدخول تلقائياً وتوجيهك للصفحة الرئيسية',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="bg-blue-100 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i+1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="bg-green-50 border-r-4 border-green-400 p-4 rounded-lg mt-4">
              <p className="text-sm text-green-800"><b>✅ ما بعد التسجيل:</b> يمكنك إضافة منتجات للمفضلة، إتمام الطلبات، ومتابعة طلباتك.</p>
            </div>
            <button onClick={() => setLocation('/register')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-lg">
              <UserPlus size={22}/> إنشاء حساب الآن ← اضغط هنا
            </button>
            <button onClick={() => setLocation('/register')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
              <UserPlus size={20}/> إنشاء حساب الآن
            </button>
          </section>

          {/* 2. الدخول */}
          <section id="login" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-purple-100 p-3 rounded-xl"><LogIn className="text-purple-600" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">2. تسجيل الدخول</h2>
                <p className="text-sm text-gray-500">العودة إلى حسابك</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                'اذهب إلى /login أو اضغط "تسجيل الدخول" من القائمة الجانبية',
                'أدخل البريد الإلكتروني',
                'أدخل كلمة المرور (يمكنك إظهارها بأيقونة العين 👁️)',
                'اضغط "تسجيل الدخول"',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="bg-purple-100 text-purple-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i+1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded-lg mt-4">
              <p className="text-sm text-blue-800"><b>💡 توجيه ذكي:</b> إذا كنت مديراً، ستنتقل تلقائياً إلى لوحة التحكم. أما العميل، فيبقى في المتجر.</p>
            </div>
            <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-lg mt-2">
              <p className="text-sm text-yellow-800"><b>⚠️ بيانات المدير:</b> admin@lamsa.com / admin123</p>
            </div>
            <button onClick={() => setLocation('/login')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-lg">
              <LogIn size={22}/> تسجيل الدخول ← اضغط هنا
            </button>
            <button onClick={() => setLocation('/login')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
              <LogIn size={20}/> تسجيل الدخول الآن
            </button>
          </section>

          {/* 3. التسوق */}
          <section id="shopping" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-amber-100 p-3 rounded-xl"><Search className="text-amber-600" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">3. التسوق والبحث</h2>
                <p className="text-sm text-gray-500">اكتشف منتجاتنا</p>
              </div>
            </div>
            <button onClick={() => setLocation('/')} className="w-full mb-4 bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
              <Search size={20}/> ابدأ التسوق الآن
            </button>
            <button onClick={() => setLocation('/')} className="w-full mb-4 bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-lg">
              <Search size={22}/> ابدأ التسوق ← اضغط هنا
            </button>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#6b174d] mb-2">🔍 البحث</h3>
                <p className="text-gray-700 text-sm">استخدم شريط البحث في الأعلى أو من القائمة الجانبية.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#6b174d] mb-2">📂 الفئات</h3>
                <p className="text-gray-700 text-sm">اختر من: فساتين، عبايات، أحذية، حقائب.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#6b174d] mb-2">🏷️ الفلاتر</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 pr-4">
                  <li><b>عروض:</b> منتجات عليها خصم</li>
                  <li><b>الأكثر مبيعاً:</b> المنتجات الرائجة</li>
                  <li><b>جديد:</b> أحدث الإضافات</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. السلة */}
          <section id="cart" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-orange-100 p-3 rounded-xl"><ShoppingCart className="text-orange-600" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">4. سلة المشتريات</h2>
                <p className="text-sm text-gray-500">إدارة منتجاتك</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                'عند الضغط على "أضيفي للسلة"، يظهر عدّاد في الأعلى',
                'اذهب إلى /cart أو اضغط أيقونة السلة',
                'يمكنك: تعديل الكمية (+/-)، حذف منتج، إدخال كود خصم',
                'اضغط "إتمام الطلب" (زر ذهبي)',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="bg-orange-100 text-orange-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i+1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="bg-green-50 border-r-4 border-green-400 p-4 rounded-lg mt-4">
              <p className="text-sm text-green-800"><b>🎁 شحن مجاني:</b> للطلبات فوق 20,000 (حسب عملة المتجر).</p>
            </div>
            <button onClick={() => setLocation('/cart')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-lg">
              <ShoppingCart size={22}/> اذهب للسلة ← اضغط هنا
            </button>
            <button onClick={() => setLocation('/cart')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
              <ShoppingCart size={20}/> اذهب للسلة
            </button>
          </section>

          {/* 5. الدفع */}
          <section id="checkout" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-teal-100 p-3 rounded-xl"><CreditCard className="text-teal-600" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">5. إتمام الطلب</h2>
                <p className="text-sm text-gray-500">الخطوة الأخيرة</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                'بيانات العميل: الاسم، الهاتف',
                'عنوان التوصيل: المدينة، العنوان التفصيلي',
                'طريقة الدفع: الدفع عند الاستلام',
                'ملخص الطلب: راجع المنتجات والإجمالي',
                'اضغط "تأكيد الطلب"',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="bg-teal-100 text-teal-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i+1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded-lg mt-4">
              <p className="text-sm text-blue-800"><b>💡 ملاحظة:</b> بعد التأكيد، تظهر صفحة شكر برقم الطلب. احتفظ به لتتبع طلبك.</p>
            </div>
            <button onClick={() => setLocation('/checkout')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-lg">
              <CreditCard size={22}/> اذهب للدفع ← اضغط هنا
            </button>
          </section>

          {/* 6. التتبع */}
          <section id="track" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-indigo-100 p-3 rounded-xl"><Truck className="text-indigo-600" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">6. تتبع الطلب</h2>
                <p className="text-sm text-gray-500">أين طلبك الآن؟</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                'اذهب إلى /track',
                'اختر رقم الطلب أو رقم الهاتف',
                'أدخل الرقم → اضغط "بحث"',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="bg-indigo-100 text-indigo-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i+1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="bg-green-50 border-r-4 border-green-400 p-4 rounded-lg mt-4">
              <p className="text-sm text-green-800"><b>✅ مراحل التتبع:</b> استلام → تجهيز → شحن → توصيل. شريط تقدم مرئي.</p>
            </div>
            <button onClick={() => setLocation('/track')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-lg">
              <Truck size={22}/> تتبع طلبك ← اضغط هنا
            </button>
            <button onClick={() => setLocation('/track')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
              <Truck size={20}/> تتبع طلبك
            </button>
          </section>

          {/* 7. الحساب */}
          <section id="account" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-purple-100 p-3 rounded-xl"><Users className="text-purple-600" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">7. صفحة الحساب</h2>
                <p className="text-sm text-gray-500">بياناتك وطلباتك</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">اذهب إلى /profile لعرض:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 pr-4">
              <li><b>بياناتك:</b> الاسم، البريد، الدور</li>
              <li><b>سجل الطلبات:</b> كل طلباتك السابقة</li>
              <li><b>زر تتبع:</b> لكل طلب مباشرة</li>
            </ul>
            <button onClick={() => setLocation('/profile')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-lg">
              <Users size={22}/> اذهب لحسابي ← اضغط هنا
            </button>
            <button onClick={() => setLocation('/profile')} className="mt-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
              <Users size={20}/> اذهب لحسابي
            </button>
          </section>

          {/* 8. المفضلة */}
          <section id="wishlist" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-red-100 p-3 rounded-xl"><Heart className="text-red-600" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">8. المفضلة</h2>
                <p className="text-sm text-gray-500">احفظ منتجاتك</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                'افتح صفحة المنتج',
                'اضغط أيقونة القلب (أعلى الصفحة)',
                'المنتج يُضاف إلى /wishlist',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="bg-red-100 text-red-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i+1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 9. لوحة التحكم */}
          <section id="admin" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-gray-200 p-3 rounded-xl"><Settings className="text-gray-700" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">9. لوحة التحكم (للمدير)</h2>
                <p className="text-sm text-gray-500">إدارة المتجر</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">إذا كنت مديراً، يمكنك الوصول إلى /admin لإدارة:</p>
            <button onClick={() => setLocation('/admin')} className="mb-4 w-full bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-lg">
              <Settings size={22}/> فتح لوحة التحكم ← اضغط هنا
            </button>
            <button onClick={() => setLocation('/admin')} className="w-full mb-4 bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
              <Settings size={20}/> فتح لوحة التحكم
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                '📊 نظرة عامة: الإحصائيات والطلبات الأخيرة',
                '📦 المنتجات: إضافة، تعديل، حذف',
                '📂 الفئات: إدارة تصنيفات المتجر',
                '💰 الخصومات: تطبيق خصم بنسبة وتاريخ',
                '🎁 الكوبونات: إنشاء أكواد خصم',
                '🛍️ الطلبات: تتبع الطلبات وتحديث حالتها',
                '👥 المستخدمون: إدارة العملاء والمديرين',
                '📈 التقارير: مبيعات، أرباح، منتجات راكدة',
                '⚙️ الإعدادات: اسم المتجر، العملة، الهاتف',
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">{item}</div>
              ))}
            </div>
          </section>

          {/* 10. نصائح */}
          <section id="tips" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="bg-yellow-100 p-3 rounded-xl"><AlertTriangle className="text-yellow-600" size={28}/></div>
              <div>
                <h2 className="text-2xl font-bold text-[#2a1a21]">10. نصائح مهمة</h2>
                <p className="text-sm text-gray-500">نصائح ذهبية</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: '📸', title: 'الصور', text: 'استخدم صوراً عالية الجودة' },
                { icon: '💰', title: 'الأسعار', text: 'بالريال مباشرة' },
                { icon: '📦', title: 'المخزون', text: 'يُخصم تلقائياً عند البيع' },
                { icon: '🎁', title: 'الشحن المجاني', text: 'للطلبات فوق 20,000' },
                { icon: '🔐', title: 'الأمان', text: 'لا تشارك كلمة المرور' },
                { icon: '🌙', title: 'الوضع الليلي', text: 'اضغط القمر في الأعلى' },
                { icon: '💾', title: 'النسخ الاحتياطي', text: 'احفظ نسخة شهرياً' },
                { icon: '📱', title: 'الجوال', text: 'المتجر يعمل بامتياز على الجوال' },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <p className="font-bold text-sm text-[#2a1a21]">{tip.title}</p>
                    <p className="text-xs text-gray-600">{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* تذييل */}
        <div className="text-center mt-10 py-6 border-t">
          <p className="text-lg font-bold text-[#2a1a21]" style={{ fontFamily: "'Amiri', serif" }}>متجر لمسة</p>
          <p className="text-sm text-gray-500 mt-1">دليل الاستخدام الإصدار 3.0</p>
          <div className="flex justify-center gap-4 mt-3 text-sm">
            <a href="tel:+967775799926" className="flex items-center gap-1 text-[#6b174d] hover:text-[#C9A84C]">
              <Phone size={14}/> +967 775 799 926
            </a>
            <a href="mailto:burhanalzekri77@gmail.com" className="flex items-center gap-1 text-[#6b174d] hover:text-[#C9A84C]">
              <Mail size={14}/> burhanalzekri77@gmail.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
