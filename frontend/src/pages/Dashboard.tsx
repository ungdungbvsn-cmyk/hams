import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Monitor, CheckCircle2, AlertTriangle, Trash2, ShieldCheck, Filter, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300'];

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState({ departmentId: 'all', equipmentTypeId: 'all' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchMasterData = async () => {
    try {
      const [depRes, typeRes] = await Promise.all([
        apiClient.get('/master/departments'),
        apiClient.get('/equipment-types')
      ]);
      setDepartments(depRes.data);
      setEquipmentTypes(typeRes.data);
    } catch (error) {
      console.error('Error fetching master data');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/dashboard/stats', { params: filters });
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Tổng quan Hệ thống</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic-font">Theo dõi thời gian thực tình trạng tài sản & thiết bị</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <Filter size={16} className="text-primary" />
            <select 
              value={filters.departmentId} 
              onChange={e => setFilters({...filters, departmentId: e.target.value})}
              className="bg-transparent text-sm font-bold outline-none min-w-[140px] cursor-pointer"
            >
              <option value="all">Tất cả khoa phòng</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <Filter size={16} className="text-primary" />
            <select 
              value={filters.equipmentTypeId} 
              onChange={e => setFilters({...filters, equipmentTypeId: e.target.value})}
              className="bg-transparent text-sm font-bold outline-none min-w-[140px] cursor-pointer"
            >
              <option value="all">Tất cả loại TB</option>
              {equipmentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Card 1: Total */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Monitor size={80} />
          </div>
          <h3 className="text-gray-400 font-extrabold text-[11px] uppercase tracking-widest">Tổng Tài sản & TB</h3>
          <p className="text-5xl font-black mt-3 text-gray-900 dark:text-white tracking-tighter">
            {loading ? '...' : (stats?.total || 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Dữ liệu toàn hệ thống
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={80} className="text-green-500" />
          </div>
          <h3 className="text-gray-400 font-extrabold text-[11px] uppercase tracking-widest">Đang hoạt động</h3>
          <p className="text-5xl font-black mt-3 text-green-500 tracking-tighter">
            {loading ? '...' : (stats?.active || 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600">
            Sẵn sàng sử dụng
          </div>
        </div>

        {/* Card 3: Broken/Maintenance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <AlertTriangle size={80} className="text-orange-500" />
          </div>
          <h3 className="text-gray-400 font-extrabold text-[11px] uppercase tracking-widest">Hỏng / Sửa chữa</h3>
          <p className="text-5xl font-black mt-3 text-orange-500 tracking-tighter">
            {loading ? '...' : (stats?.broken || 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-600">
            Cần kỹ thuật xử lý
          </div>
        </div>

        {/* Card 4: Disposed */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Trash2 size={80} className="text-gray-500" />
          </div>
          <h3 className="text-gray-400 font-extrabold text-[11px] uppercase tracking-widest">Thanh lý / Thu hồi</h3>
          <p className="text-5xl font-black mt-3 text-gray-400 tracking-tighter">
            {loading ? '...' : (stats?.retired || 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
            Ngừng khai thác
          </div>
        </div>

        {/* Card 5: Calibration */}
        <div className="bg-gradient-to-br from-primary/90 to-purple-700 p-6 rounded-[2rem] shadow-xl shadow-primary/20 text-white hover:brightness-110 transition-all group overflow-hidden relative border border-white/10">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform text-white">
            <ShieldCheck size={80} />
          </div>
          <h3 className="text-white/60 font-extrabold text-[11px] uppercase tracking-widest">Sắp kiểm định</h3>
          <p className="text-5xl font-black mt-3 text-white tracking-tighter">
            {loading ? '...' : (stats?.calibrationSoon || 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/80">
            Trong vòng 30 ngày tới
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-indigo-500 pl-4 uppercase">Tỷ lệ Tài sản theo Khoa phòng</h4>
          <div className="h-[350px]">
            {stats?.assetsByDepartment?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.assetsByDepartment}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {stats.assetsByDepartment.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '15px', border: 'none' }} 
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any, name: any) => [`${value} thiết bị`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-medium tracking-wider">Không đủ dữ liệu thống kê</div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-emerald-500 pl-4 uppercase">Số lượng chi tiết</h4>
          <div className="h-[350px]">
            {stats ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Hoạt động', value: stats.active || 0 },
                  { name: 'Hỏng', value: stats.broken || 0 },
                  { name: 'Thanh lý', value: stats.retired || 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '15px' }} />
                  <Bar dataKey="value" fill="#10B981" radius={[10, 10, 0, 0]} barSize={40}>
                    <LabelList dataKey="value" position="top" fill="#059669" fontSize={14} fontWeight="black" offset={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400 font-medium tracking-wider">Không có dữ liệu</div>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-500">
            <Zap size={150} />
          </div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-blue-500 pl-4 uppercase z-10">AI-Powered System Insights</h4>
          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-4 z-10">
            <div className="p-3 bg-primary/10 rounded-xl text-primary mt-1 shadow-sm">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-[15px] leading-relaxed">
                Dựa trên tần suất hỏng hóc gần đây, thiết bị <span className="text-primary font-bold">Máy X-Quang SR-500</span> tại Khoa Chẩn đoán hình ảnh có khả năng cần bảo trì định kỳ trong 2 tuần tới. 
              </p>
              <button className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2">Lập phiếu bảo trì ngay</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

