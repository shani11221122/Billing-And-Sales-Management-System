import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, DollarSign, Package, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import Card from '../components/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_sales: 0, total_revenue: 0, total_customers: 0, total_products: 0, total_inventory_value: 0,
    recent_activity: [], monthly_revenue: [], low_stock_items: [], stock_distribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/sales/stats', { headers: { 'x-auth-token': token } });
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#64748B'];

  const CustomAreaTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-textPrimary text-card px-3 py-2 rounded-lg text-xs shadow-xl">
          <p className="text-textSecondary text-[10px] mb-0.5">{label}</p>
          <p className="font-bold">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const statCards = [
    {
      label: 'Total Products',
      value: stats.total_products,
      sub: 'In Catalog',
      icon: Package,
      accent: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Inventory Value',
      value: `$${Number(stats.total_inventory_value || 0).toLocaleString()}`,
      sub: 'Asset Total',
      icon: DollarSign,
      accent: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Low Stock',
      value: stats.low_stock_items?.length || 0,
      sub: 'Needs Restock',
      icon: AlertCircle,
      accent: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Total Revenue',
      value: `$${Number(stats.total_revenue || 0).toLocaleString()}`,
      sub: 'All Time',
      icon: TrendingUp,
      accent: 'text-textPrimary',
      bg: 'bg-textSecondary/10',
    },
  ];

  if (loading) return (
    <div className="flex h-full items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
        <p className="text-textSecondary text-sm font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Business Overview</h2>
          <p className="text-textSecondary text-sm mt-0.5">A live snapshot of your business performance.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 ${card.bg} ${card.accent} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon size={18} />
                </div>
                <ArrowUpRight size={14} className="text-border group-hover:text-textSecondary transition-colors mt-1" />
              </div>
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-textPrimary tracking-tight">{card.value}</p>
              <p className="text-[10px] text-textSecondary font-medium mt-1">{card.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Area Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-textPrimary">Revenue Trend</h3>
              <p className="text-[10px] text-textSecondary font-medium mt-0.5">Monthly earnings overview</p>
            </div>
            <select className="bg-background border border-border rounded-lg text-[10px] font-bold text-textSecondary uppercase tracking-wider px-2.5 py-1.5 outline-none">
              <option>6 Months</option>
              <option>1 Year</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthly_revenue} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart */}
        <Card className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-textPrimary">Stock Distribution</h3>
            <p className="text-[10px] text-textSecondary font-medium mt-0.5">Top product categories</p>
          </div>
          <div className="flex-1 relative min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.stock_distribution}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={74}
                  paddingAngle={3} dataKey="value" stroke="none"
                >
                  {stats.stock_distribution?.map((_, index) => (
                    <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '0.5rem', fontSize: '11px', color: '#FFFFFF' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-textPrimary">{stats.total_products}</span>
              <span className="text-[9px] text-textSecondary uppercase tracking-widest font-bold">SKUs</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
            {stats.stock_distribution?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-[10px] font-medium text-textSecondary">
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="truncate max-w-[70px]">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Low Stock */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-textPrimary">Low Stock Alerts</h3>
            <span className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] font-bold rounded border border-warning/20 uppercase tracking-wide">
              {stats.low_stock_items?.length || 0} Items
            </span>
          </div>
          <div className="p-6 space-y-4">
            {stats.low_stock_items?.map(item => (
              <div key={item.id}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-textPrimary">{item.name}</span>
                  <span className={`font-bold ${item.stock < 10 ? 'text-danger' : 'text-warning'}`}>{item.stock} left</span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${item.stock < 10 ? 'bg-danger' : 'bg-warning'}`}
                    style={{ width: `${Math.min((item.stock / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {(!stats.low_stock_items || stats.low_stock_items.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={24} className="text-success mb-2" />
                <p className="text-textPrimary text-sm font-semibold">All stock levels are healthy</p>
                <p className="text-xs text-textSecondary mt-1">No restock needed right now.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-textPrimary">Recent Transactions</h3>
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wide">{stats.recent_activity?.length} Latest</span>
          </div>
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent_activity.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <span className="text-[10px] font-bold text-textSecondary bg-background px-2 py-0.5 rounded font-mono">#{sale.id}</span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-textPrimary">{sale.customer_name || 'Counter Sale'}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-textPrimary">${Number(sale.total_amount).toFixed(2)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
