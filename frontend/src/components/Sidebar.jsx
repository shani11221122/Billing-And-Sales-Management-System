import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Truck, FileText, DollarSign, Percent, Archive, User } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Operations',
      items: [
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Sales', path: '/sales', icon: ShoppingCart },
        { name: 'Inventory', path: '/inventory', icon: Archive },
      ]
    },
    {
      label: 'Finance',
      items: [
        { name: 'Invoices', path: '/invoices', icon: FileText },
        { name: 'Payments', path: '/payments', icon: DollarSign },
        { name: 'Discounts', path: '/discounts', icon: Percent },
      ]
    },
    {
      label: 'Partners',
      items: [
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Suppliers', path: '/suppliers', icon: Truck },
        { name: 'Purchases', path: '/purchases', icon: ShoppingCart },
      ]
    },
  ];

  return (
    <div className="w-60 bg-card border-r border-border flex flex-col z-20 select-none">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm leading-none">B</span>
          </div>
          <span className="text-textPrimary font-bold text-base tracking-tight">BillingSaaS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1 text-[9px] font-bold text-textSecondary uppercase tracking-widest">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group relative ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-textSecondary hover:bg-primary/5 hover:text-textPrimary font-medium'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-primary' : 'text-textSecondary group-hover:text-textPrimary transition-colors'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile + Logout */}
      <div className="p-3 border-t border-border shrink-0">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all mb-1 ${
            location.pathname === '/profile'
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-textSecondary hover:bg-primary/5 hover:text-textPrimary font-medium'
          }`}
        >
          <User size={16} className={location.pathname === '/profile' ? 'text-primary' : 'text-textSecondary'} />
          <span>Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-textSecondary hover:bg-danger/10 hover:text-danger rounded-lg transition-all text-sm font-medium group"
        >
          <LogOut size={16} className="transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
