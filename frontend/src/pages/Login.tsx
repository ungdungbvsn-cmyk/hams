import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f3ec] dark:bg-[#16171d] p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-purple-500/20 blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-md w-full bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative z-10">
        <div className="p-10">
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30 rotate-3 hover:rotate-0 transition-transform duration-300">
               <Activity size={40} className="text-white drop-shadow-md" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">HAMS</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Hệ thống Quản lý Tài sản Y Tế</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium flex items-center gap-2"><ShieldCheck size={18}/> {error}</div>}
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 pl-1">Tên đăng nhập</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-700 bg-[black] text-white focus:ring-4 focus:ring-primary/50 focus:border-primary focus:outline-none transition shadow-sm placeholder-gray-500"
                placeholder="admin"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 pl-1">Mật khẩu</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-700 bg-[black] text-white focus:ring-4 focus:ring-primary/50 focus:border-primary focus:outline-none transition shadow-sm placeholder-gray-500"
                placeholder="password123"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold text-lg hover:from-primary-hover hover:to-purple-700 shadow-xl shadow-primary/25 active:scale-[0.98] transition-all flex justify-center disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập vào Hệ thống'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
