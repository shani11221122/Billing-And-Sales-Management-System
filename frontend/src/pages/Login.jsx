import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, User } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const { data } = await axios.post(endpoint, formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-textPrimary font-bold text-xl tracking-tight">BillingSaaS</span>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-textPrimary tracking-tight text-center mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-textSecondary text-sm text-center mb-6">
            {isLogin ? 'Sign in to access your dashboard.' : 'Get started with BillingSaaS today.'}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-danger/10 text-danger px-4 py-3 rounded-lg text-sm border border-danger/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0"></span>
                {error}
              </div>
            )}

            {!isLogin && (
              <Input
                label="Full Name"
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            )}

            <Input
              label="Email"
              type="email"
              required
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? 'Signing in...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <p className="text-center text-sm text-textSecondary mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary font-semibold hover:text-primary/80 transition-colors">
              {isLogin ? 'Register' : 'Sign in'}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
