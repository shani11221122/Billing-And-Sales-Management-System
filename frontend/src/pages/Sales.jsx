import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const loadData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        axios.get('/api/customers', { headers: { 'x-auth-token': token } }),
        axios.get('/api/products', { headers: { 'x-auth-token': token } })
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async (query = '') => {
    try {
      const params = query ? { search: query } : {};
      const res = await axios.get('/api/sales', { headers: { 'x-auth-token': token }, params });
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); fetchSales(); }, []);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = () => {
    if(!selectedProductId) return;
    const prod = products.find(p => String(p.id) === String(selectedProductId));
    if(!prod) return;
    
    // Check if already in cart
    const existingIndex = cart.findIndex(c => String(c.product_id) === String(prod.id));
    if(existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += Number(quantity);
      setCart(newCart);
    } else {
      setCart([...cart, { product_id: prod.id, name: prod.name, price: prod.price, quantity: Number(quantity) }]);
    }
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const submitSale = async (e) => {
    e.preventDefault();
    if(cart.length === 0) return alert('Cannot create an empty sale! Please add products.');
    if(!selectedCustomerId) return alert('Please select a customer.');

    try {
      await axios.post('/api/sales', {
        customer_id: selectedCustomerId,
        total_amount: totalAmount,
        items: cart
      }, { headers: { 'x-auth-token': token } });
      
      setIsModalOpen(false);
      setCart([]);
      setSelectedCustomerId('');
      loadData();
      fetchSales();
    } catch (err) {
      console.error(err);
      alert('Failed to execute sale. Check server logs.');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart size={24} className="text-slate-700" />
            Sales & Invoicing
          </h2>
          <p className="text-slate-500 text-sm mt-1">Process new transactions and track sales history.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus size={18} /> New Transaction
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <SearchBar onSearch={fetchSales} placeholder="Search transactions..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Sale ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map(sale => (
                 <tr key={sale.id} className="hover:bg-slate-50/50">
                   <td className="px-6 py-4 text-xs font-bold text-slate-600">#{sale.id}</td>
                   <td className="px-6 py-4">
                     <div className="text-sm font-semibold text-slate-800">{sale.customer_name || 'Walk-in'}</div>
                     <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">By: {sale.user_name || 'System'}</div>
                   </td>
                   <td className="px-6 py-4 text-xs font-medium text-slate-500">
                     {new Date(sale.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                   </td>
                   <td className="px-6 py-4 text-sm font-bold text-slate-900">
                     ${parseFloat(sale.total_amount).toFixed(2)}
                   </td>
                   <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        sale.status === 'paid' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                          {sale.status}
                      </span>
                   </td>
                 </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <p className="text-slate-400 text-sm font-medium">No sales recorded today.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-md font-bold text-slate-900">Create New Sale</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                 <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Customer Selector */}
              <div className="max-w-xs">
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Select Customer</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                  value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">-- Search Customer --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Product Adder */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Product</label>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                    value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- Choose Item --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Qty</label>
                  <input type="number" min="1" className="w-full px-3 py-2 bg-white border border-slate-200 text-center rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors" value={quantity} onChange={e => setQuantity(e.target.value)} />
                </div>
                <button type="button" onClick={addToCart} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors">
                  Add to Cart
                </button>
              </div>

              {/* Cart Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                       <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item</th>
                       <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</th>
                       <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                       <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</th>
                       <th className="px-6 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {cart.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 text-sm font-semibold text-slate-800">{item.name}</td>
                        <td className="px-6 py-3 text-xs font-medium text-slate-500">${Number(item.price).toFixed(2)}</td>
                        <td className="px-6 py-3 text-sm font-bold text-slate-900">{item.quantity}</td>
                        <td className="px-6 py-3 text-sm font-bold text-slate-900 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                        <td className="px-6 py-3 text-center">
                           <button onClick={() => removeFromCart(i)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                              <Trash2 size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-300 text-xs italic">
                          No items in cart.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grand Total</p>
                 <h2 className="text-3xl font-bold text-slate-900 tracking-tight">${totalAmount.toFixed(2)}</h2>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="button" onClick={submitSale} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center gap-2">
                   Finalize Sale <ArrowRight size={16}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
