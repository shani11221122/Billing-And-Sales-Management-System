import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Products = lazy(() => import('./pages/Products'));
const Sales = lazy(() => import('./pages/Sales'));
const Customers = lazy(() => import('./pages/Customers'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const Purchases = lazy(() => import('./pages/Purchases'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Payments = lazy(() => import('./pages/Payments'));
const Discounts = lazy(() => import('./pages/Discounts'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Profile = lazy(() => import('./pages/Profile'));
const Register = lazy(() => import('./pages/Register'));

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
}

const pageTitles = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/sales': 'Sales',
  '/customers': 'Customers',
  '/suppliers': 'Suppliers',
  '/purchases': 'Purchases',
  '/invoices': 'Invoices',
  '/payments': 'Payments',
  '/discounts': 'Discounts',
  '/inventory': 'Inventory',
  '/profile': 'Profile',
};

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-screen bg-background text-textPrimary overflow-hidden font-sans">
      {!isAuthPage && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        {!isAuthPage && (
          <header className="bg-card border-b border-border h-14 flex items-center justify-between px-6 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-textSecondary font-medium">BillingSaaS</span>
              <span className="text-slate-200 text-xs">/</span>
              <span className="text-sm font-semibold text-textPrimary">{pageTitle}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-textPrimary leading-tight">Admin User</p>
                <p className="text-[10px] font-medium text-textSecondary">Administrator</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                AU
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          <Suspense fallback={
            <div className="flex h-full items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                <p className="text-textSecondary text-sm font-medium">Loading...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
              <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/discounts" element={<ProtectedRoute><Discounts /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
