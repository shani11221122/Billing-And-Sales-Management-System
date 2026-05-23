import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react';

export default function Discounts() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'percentage', value: '', active: true });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = async (query = '') => {
    try {
      const params = query ? { search: query } : {};
      const res = await axios.get('/api/discounts', { headers: { 'x-auth-token': token }, params });
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, active: formData.active === true || formData.active === 'true' };
      if (editingId) {
        await axios.put(`/api/discounts/${editingId}`, payload, { headers: { 'x-auth-token': token } });
      } else {
        await axios.post('/api/discounts', payload, { headers: { 'x-auth-token': token } });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', type: 'percentage', value: '', active: true });
      fetchData();
    } catch (err) {
      console.error('Error submitting', err);
      alert('Error saving discount: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this discount?')) {
      try {
        await axios.delete(`/api/discounts/${id}`, { headers: { 'x-auth-token': token } });
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
      name: item.name,
      type: item.type,
      value: item.value,
      active: item.active,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag size={24} className="text-slate-700" />
            Discounts & Promotions
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage active codes and business promotions.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', type: 'percentage', value: '', active: true });
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus size={18} /> New Promotion
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
           <SearchBar onSearch={fetchData} placeholder="Search discounts..." />
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Voucher</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Benefit</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      item.type === 'percentage' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {item.type === 'percentage' ? `${item.value}%` : `$${parseFloat(item.value).toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      item.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {item.active ? 'Active' : 'Hidden'}
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
                      <Tag size={32} className="text-slate-400 mb-2" />
                      <p className="text-slate-400 text-sm font-medium">No promotions found.</p>
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
                 {editingId ? 'Edit Promotion' : 'New Promotion'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                 <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Seasonal Clearance"
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Type</label>
                   <select
                     required
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                     value={formData.type}
                     onChange={e => setFormData({ ...formData, type: e.target.value })}
                   >
                     <option value="percentage">Percentage (%)</option>
                     <option value="fixed">Fixed ($)</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                     Value
                   </label>
                   <input
                     required
                     type="number"
                     step="0.01"
                     min="0"
                     max={formData.type === 'percentage' ? '100' : undefined}
                     placeholder="0.00"
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-colors font-mono"
                     value={formData.value}
                     onChange={e => setFormData({ ...formData, value: e.target.value })}
                   />
                 </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
                <select
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-slate-900 transition-colors"
                  value={String(formData.active)}
                  onChange={e => setFormData({ ...formData, active: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors">Apply Strategy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}