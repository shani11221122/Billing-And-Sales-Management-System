import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import { Plus, Edit2, Trash2, DollarSign, X } from 'lucide-react';

export default function Payments() {
  const [data, setData] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ invoice_id: '', amount: '', payment_method: 'Cash' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = async (query = '') => {
    try {
      const params = query ? { search: query } : {};
      const [payRes, invRes] = await Promise.all([
        axios.get('/api/payments', { headers: { 'x-auth-token': token }, params }),
        axios.get('/api/invoices', { headers: { 'x-auth-token': token } }),
      ]);
      setData(payRes.data);
      setInvoices(invRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (editingId) {
        await axios.put(`/api/payments/${editingId}`, payload, { headers: { 'x-auth-token': token } });
      } else {
        await axios.post('/api/payments', payload, { headers: { 'x-auth-token': token } });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ invoice_id: '', amount: '', payment_method: 'Cash' });
      fetchData();
    } catch (err) {
      console.error('Error submitting', err);
      alert('Error saving payment: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this payment record?')) {
      try {
        await axios.delete(`/api/payments/${id}`, { headers: { 'x-auth-token': token } });
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
      invoice_id: item.invoice_id || '',
      amount: item.amount || '',
      payment_method: item.payment_method || 'Cash',
    });
    setIsModalOpen(true);
  };

  const methodColors = {
    Cash: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    Card: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'Bank Transfer': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    Cheque: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign size={24} className="text-slate-700" />
            Payments & Settlements
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track financial inflows and reconcile invoices.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ invoice_id: '', amount: '', payment_method: 'Cash' });
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus size={18} /> Record Payment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <SearchBar onSearch={fetchData} placeholder="Search payments..." />
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(item => {
                const inv = invoices.find(i => i.id === parseInt(item.invoice_id));
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-800">{inv ? inv.invoice_number : `#ID-${item.invoice_id}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      ${parseFloat(item.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                         item.payment_method === 'Cash' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         item.payment_method === 'Card' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                         item.payment_method === 'Bank Transfer' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                         'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                        {item.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{item.payment_date ? new Date(item.payment_date).toLocaleDateString([], {month:'short',day:'numeric'}) : '—'}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-1">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <DollarSign size={32} className="text-slate-400 mb-2" />
                      <p className="text-slate-400 text-sm font-medium">No payment records found.</p>
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
                 {editingId ? 'Edit Payment' : 'Record Payment'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                 <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Invoice</label>
                <select
                  required
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                  value={formData.invoice_id}
                  onChange={e => setFormData({ ...formData, invoice_id: e.target.value })}
                >
                  <option value="">-- Select Invoice --</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoice_number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Amount Paid ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors font-mono"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Payment Method</label>
                <select
                  required
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                  value={formData.payment_method}
                  onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors">
                  {editingId ? 'Update Record' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}