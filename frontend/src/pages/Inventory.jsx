import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import { Plus, Edit2, Trash2, Package, X } from 'lucide-react';

export default function Inventory() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ product_id: '', transaction_type: 'IN', quantity: '', notes: '' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = async (query = '') => {
    try {
      const params = query ? { search: query } : {};
      const [invRes, prodRes] = await Promise.all([
        axios.get('/api/inventory', { headers: { 'x-auth-token': token }, params }),
        axios.get('/api/products', { headers: { 'x-auth-token': token } }),
      ]);
      setData(invRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getProductName = (id) => {
    const p = products.find(p => p.id === parseInt(id));
    return p ? p.name : `Product #${id}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, quantity: parseInt(formData.quantity) };
      if (editingId) {
        await axios.put(`/api/inventory/${editingId}`, payload, { headers: { 'x-auth-token': token } });
      } else {
        await axios.post('/api/inventory', payload, { headers: { 'x-auth-token': token } });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ product_id: '', transaction_type: 'IN', quantity: '', notes: '' });
      fetchData();
    } catch (err) {
      console.error('Error submitting', err);
      alert('Error saving inventory: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this inventory record?')) {
      try {
        await axios.delete(`/api/inventory/${id}`, { headers: { 'x-auth-token': token } });
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Error deleting record.');
      }
    }
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      product_id: item.product_id || '',
      transaction_type: item.transaction_type || 'IN',
      quantity: item.quantity || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const typeColors = { 
    IN: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', 
    OUT: 'bg-red-500/10 text-red-500 border border-red-500/20', 
    Adjustment: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package size={24} className="text-slate-700" />
            Inventory Movements
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track stock movements and warehouse adjustments.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ product_id: '', transaction_type: 'IN', quantity: '', notes: '' });
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus size={18} /> New movement
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
           <SearchBar onSearch={fetchData} placeholder="Search logs..." />
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-800">{getProductName(item.product_id)}</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide truncate max-w-[200px]">{item.notes || 'No remarks'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      item.transaction_type === 'IN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      item.transaction_type === 'OUT' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {item.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {item.transaction_type === 'OUT' ? '-' : '+'}{Math.abs(item.quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric'}) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap space-x-1">
                    <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Package size={32} className="text-slate-400 mb-2" />
                      <p className="text-slate-400 text-sm font-medium">No movements recorded.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-md font-bold text-slate-900">
                 {editingId ? 'Edit Movement' : 'New Movement'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                 <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Product</label>
                <select
                  required
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                  value={formData.product_id}
                  onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Type</label>
                   <select
                     required
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                     value={formData.transaction_type}
                     onChange={e => setFormData({ ...formData, transaction_type: e.target.value })}
                   >
                     <option value="IN">Stock In</option>
                     <option value="OUT">Stock Out</option>
                     <option value="Adjustment">Adjustment</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Quantity</label>
                   <input
                     required
                     type="number"
                     min="1"
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors"
                     value={formData.quantity}
                     onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                     placeholder="0"
                   />
                 </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea
                  rows={2}
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Reason for adjustment..."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}