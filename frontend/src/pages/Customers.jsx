import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const token = localStorage.getItem('token');
  const fetchCustomers = async (query = '') => {
    try {
      const params = query ? { search: query } : {};
      const res = await axios.get('/api/customers', { headers: { 'x-auth-token': token }, params });
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/customers/${editingId}`, formData, { headers: { 'x-auth-token': token } });
      } else {
        await axios.post('/api/customers', formData, { headers: { 'x-auth-token': token } });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert('Error saving customer: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`/api/customers/${id}`, { headers: { 'x-auth-token': token } });
        fetchCustomers();
      } catch (err) {
        console.error(err);
        alert('Error deleting customer.');
      }
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Registry</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage client information and contact details.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus size={16} /> New Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <SearchBar onSearch={fetchCustomers} placeholder="Search customers..." />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-4 whitespace-nowrap">{customers.length} Clients</span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/60">
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Address</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map(customer => {
                const initials = customer.name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?';
                const colors = ['bg-indigo-100 text-indigo-700','bg-emerald-100 text-emerald-700','bg-amber-100 text-amber-700','bg-rose-100 text-rose-700','bg-purple-100 text-purple-700'];
                const color = colors[customer.id % colors.length];
                return (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-[10px] font-bold shrink-0`}>{initials}</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{customer.name}</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-0.5">#C-{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs font-medium text-slate-700">{customer.email || '—'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{customer.phone || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs text-slate-500 truncate max-w-[180px]">{customer.address || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-1">
                    <button onClick={() => openEditModal(customer)} className="p-1.5 text-slate-300 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(customer.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Users size={32} className="text-slate-400 mb-2" />
                      <p className="text-slate-400 text-sm font-medium">No customers found.</p>
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
                 {editingId ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  required
                  type="text"
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-slate-900 outline-none transition-colors"
                  placeholder="e.g. Acme Corp"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-slate-900 outline-none transition-colors"
                    placeholder="contact@email.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input
                    type="tel"
                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-slate-900 outline-none transition-colors"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Address</label>
                <textarea
                  rows={2}
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-slate-900 outline-none transition-colors resize-none"
                  placeholder="123 Office Plaza..."
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors">
                  {editingId ? 'Update Record' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;