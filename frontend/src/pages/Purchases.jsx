import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, ShoppingCart } from 'lucide-react';
import SearchBar from '../components/SearchBar';

export default function Purchases() {
  const [data, setData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ supplier_id: '', total_amount: '', status: 'Pending' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = async (query = '') => {
    try {
      const params = query ? { search: query } : {};
      const [purRes, supRes] = await Promise.all([
        axios.get('/api/purchases', { headers: { 'x-auth-token': token }, params }),
        axios.get('/api/suppliers', { headers: { 'x-auth-token': token } }),
      ]);
      setData(purRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getSupplierName = (id) => {
    const s = suppliers.find(s => s.id === parseInt(id));
    return s ? s.name : `Supplier #${id}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, total_amount: parseFloat(formData.total_amount) };
      if (editingId) {
        await axios.put(`/api/purchases/${editingId}`, payload, { headers: { 'x-auth-token': token } });
      } else {
        await axios.post('/api/purchases', payload, { headers: { 'x-auth-token': token } });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ supplier_id: '', total_amount: '', status: 'Pending' });
      fetchData();
    } catch (err) {
      console.error('Error submitting', err);
      alert('Error saving purchase: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await axios.delete(`/api/purchases/${id}`, { headers: { 'x-auth-token': token } });
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
      supplier_id: item.supplier_id || '',
      total_amount: item.total_amount || '',
      status: item.status || 'Pending',
    });
    setIsModalOpen(true);
  };

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Received: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart size={24} className="text-slate-700" />
            Purchases & Orders
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage procurement orders and supplier billing.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ supplier_id: '', total_amount: '', status: 'Pending' });
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus size={18} /> New Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <SearchBar onSearch={fetchData} placeholder="Search orders..." />
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-600">#PO-{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-800">{getSupplierName(item.supplier_id)}</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    ${parseFloat(item.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      item.status === 'Received' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap space-x-1">
                    <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <ShoppingCart size={32} className="text-slate-400 mb-2" />
                      <p className="text-slate-400 text-sm font-medium">No purchase orders found.</p>
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
                 {editingId ? 'Edit Order' : 'New Purchase Order'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                 <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Vendor</label>
                <select
                  required
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                  value={formData.supplier_id}
                  onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                >
                  <option value="">Select established vendor...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Amount ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors"
                  value={formData.total_amount}
                  onChange={e => setFormData({ ...formData, total_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
                <select
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors">
                  {editingId ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}