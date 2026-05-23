import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, FileText, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';

export default function Invoices() {
  const [data, setData] = useState([]);
  const [sales, setSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ sale_id: '', invoice_number: '', status: 'Unpaid', due_date: '' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const fetchData = async (query = '') => {
    try {
      const params = query ? { search: query } : {};
      const [invRes, salesRes] = await Promise.all([
        axios.get('/api/invoices', { headers: { 'x-auth-token': token }, params }),
        axios.get('/api/sales', { headers: { 'x-auth-token': token } }),
      ]);
      setData(invRes.data);
      setSales(salesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingId) {
        await axios.put(`/api/invoices/${editingId}`, payload, { headers: { 'x-auth-token': token } });
      } else {
        await axios.post('/api/invoices', payload, { headers: { 'x-auth-token': token } });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ sale_id: '', invoice_number: '', status: 'Unpaid', due_date: '' });
      fetchData();
    } catch (err) {
      console.error('Error submitting', err);
      alert('Error saving invoice: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`/api/invoices/${id}`, { headers: { 'x-auth-token': token } });
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
      sale_id: item.sale_id || '',
      invoice_number: item.invoice_number || '',
      status: item.status || 'Unpaid',
      due_date: item.due_date ? item.due_date.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const generateInvoiceNumber = () => {
    return `INV-${Date.now()}`;
  };

  const statusColors = {
    Paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    Unpaid: 'bg-red-500/10 text-red-500 border border-red-500/20',
    Overdue: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText size={24} className="text-slate-700" />
            Invoices & Billing
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage customer billing and payment statuses.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ sale_id: '', invoice_number: generateInvoiceNumber(), status: 'Unpaid', due_date: '' });
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus size={18} /> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <SearchBar onSearch={fetchData} placeholder="Search invoices..." />
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Sale Ref</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Issued</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Due</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{item.invoice_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">Txn #{item.sale_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      item.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      item.status === 'Unpaid' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{item.issue_date ? new Date(item.issue_date).toLocaleDateString([], { month: 'short', day: 'numeric'}) : '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700">{item.due_date ? new Date(item.due_date).toLocaleDateString([], { month: 'short', day: 'numeric'}) : '—'}</td>
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
                      <FileText size={32} className="text-slate-400 mb-2" />
                      <p className="text-slate-400 text-sm font-medium">No invoices found.</p>
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
                 {editingId ? 'Edit Invoice' : 'New Invoice'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                 <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Sale Reference</label>
                <select
                  required
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                  value={formData.sale_id}
                  onChange={e => setFormData({ ...formData, sale_id: e.target.value })}
                >
                  <option value="">-- Connect Transaction --</option>
                  {sales.map(s => (
                    <option key={s.id} value={s.id}>Txn #{s.id} (${parseFloat(s.total_amount || 0).toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Invoice Number</label>
                <input
                  required
                  type="text"
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors font-mono"
                  value={formData.invoice_number}
                  onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
                   <select
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                     value={formData.status}
                     onChange={e => setFormData({ ...formData, status: e.target.value })}
                   >
                     <option value="Unpaid">Unpaid</option>
                     <option value="Paid">Paid</option>
                     <option value="Overdue">Overdue</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Due Date</label>
                   <input
                     type="date"
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                     value={formData.due_date}
                     onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                   />
                 </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors">
                  {editingId ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}