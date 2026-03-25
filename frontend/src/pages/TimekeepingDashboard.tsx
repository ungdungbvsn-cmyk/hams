import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Users, UserMinus, UserCheck, Calendar, Filter, Clock } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';

interface DashboardStats {
  totalEmployees: number;
  clockedCount: number;
  notClockedCount: number;
  overtimePeopleCount: number;
  totalOvertimeHours: number;
  breakdown: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const TimekeepingDashboard = () => {
  const user = useAuthStore(state => state.user);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [date, selectedDept]);

  const fetchDepartments = async () => {
    try {
      const { data } = await apiClient.get('/departments');
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/timekeeping/stats', {
        params: { date, departmentId: selectedDept }
      });
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Thống kê Chấm công</h1>
          <p className="text-gray-500 text-sm">Phân tích dữ liệu chuyên cần và biểu đồ trạng thái</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-gray-100 dark:border-gray-700">
            <Calendar size={18} className="text-blue-500" />
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="bg-transparent border-none text-sm font-bold focus:ring-0 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 px-3">
            <Filter size={18} className="text-indigo-500" />
            <select 
              value={selectedDept} 
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-transparent border-none text-sm font-bold focus:ring-0 outline-none"
            >
              <option value="">Tất cả khoa phòng</option>
              {(user?.role.name === 'ADMIN' ? departments : departments.filter(d => user?.departments?.some(ud => ud.id === d.id))).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 flex items-center gap-5">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng nhân viên</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats?.totalEmployees || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-red-500/5 flex items-center gap-5">
          <div className="p-4 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl shadow-inner">
            <UserMinus size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Số chưa chấm</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats?.notClockedCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-green-500/5 flex items-center gap-5">
          <div className="p-4 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-2xl shadow-inner">
            <UserCheck size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Đã chấm công</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats?.clockedCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-purple-500/5 flex items-center gap-5">
          <div className="p-4 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl shadow-inner">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Người làm thêm</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats?.overtimePeopleCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-amber-500/5 flex items-center gap-5">
          <div className="p-4 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl shadow-inner">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng làm thêm(h)</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats?.totalOvertimeHours || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-8 border-l-4 border-indigo-500 pl-4 uppercase">Tỷ lệ Trạng thái</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.breakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {stats?.breakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '15px' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-8 border-l-4 border-emerald-500 pl-4 uppercase">Số lượng chi tiết</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.breakdown || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#4F46E5" radius={[10, 10, 0, 0]} barSize={40}>
                  <LabelList dataKey="value" position="top" fill="#4B5563" fontSize={14} fontWeight="black" offset={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
