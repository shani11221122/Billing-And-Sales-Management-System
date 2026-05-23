import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Package, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '' });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (query = '') => {
    setLoading(true);
    const params = query ? { search: query } : {};
    const res = await axios.get('/api/products', { headers: { 'x-auth-token': token }, params });
    setProducts(res.data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`/api/products/${editingId}`, formData, { headers: { 'x-auth-token': token } });
    } else {
      await axios.post('/api/products', formData, { headers: { 'x-auth-token': token } });
    }
    setIsModalOpen(false);
    setEditingId(null);
    fetchProducts();
    setFormData({ name: '', description: '', price: '', stock: '' });
  };
  
  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, description: product.description, price: product.price, stock: product.stock });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(confirm('Are you sure you want to delete this product?')) {
      await axios.delete(`/api/products/${id}`, { headers: { 'x-auth-token': token } });
      fetchProducts();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Product Catalog</h2>
          <p className="text-textSecondary text-sm mt-0.5">Manage your inventory items and pricing rules.</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', price: '', stock: '' });
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" /> New Product
        </Button>
      </div>

      <Card>
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <SearchBar onSearch={fetchProducts} placeholder="Search products..." />
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider ml-4 whitespace-nowrap">{products.length} Items</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="4" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                    <p className="text-textSecondary text-xs font-medium">Loading...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 uppercase">
                          {product.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-textPrimary">{product.name}</div>
                          <div className="text-[10px] text-textSecondary mt-0.5 truncate max-w-[200px]">{product.description || '—'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="text-sm font-bold text-textPrimary">${parseFloat(product.price).toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        product.stock > 10
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-danger/10 text-danger border-danger/20'
                      }`}>
                        {product.stock} units
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <button onClick={() => openEditModal(product)} className="p-1.5 text-textSecondary hover:text-textPrimary hover:bg-primary/5 rounded transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-textSecondary hover:text-danger hover:bg-danger/5 rounded transition-colors"><Trash2 size={14} /></button>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="4" className="px-6 py-16 text-center">
                      <Package size={28} className="text-textSecondary mx-auto mb-2" />
                      <p className="text-textSecondary text-sm font-medium">No products yet.</p>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-textPrimary">
                {editingId ? 'Edit Product' : 'New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-textPrimary transition-colors">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Product Name"
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Item name"
              />
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Short details"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                />
                <Input
                  label="Stock"
                  type="number"
                  required
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-[2]"
                >
                  {editingId ? 'Update Item' : 'Create Product'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Products;
