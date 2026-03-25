import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { ShieldCheck, Search, Filter, Zap, AlertCircle } from 'lucide-react';
import { CalibrationUpdateModal } from '../components/CalibrationUpdateModal';

export const CalibrationList = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/calibrations');
      setAssets(data);
    } catch (error) {
      console.error('Failed to fetch calibration assets');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assetCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (nextDate: string | null) => {
    if (!nextDate) return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">CHƯA KIỂM ĐỊNH</span>;
    
    const next = new Date(nextDate);
    const now = new Date();
    const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold">QUÁ HẠN</span>;
    if (diffDays < 30) return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">SẮP HẾT HẠN</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold">HỢP LỆ</span>;
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-blue-600" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Danh sách kiểm định</h1>
          <p className="text-gray-500 text-sm font-medium mt-0.5">Theo dõi hồ sơ và thời hạn kiểm định định kỳ của thiết bị y tế</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/20 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm thiết bị..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition font-medium text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-bold text-sm text-gray-600 dark:text-gray-300">
            <Filter size={18} />
            Lọc tình trạng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-12 text-xs">STT</th>
                <th className="py-4 px-6">Thiết bị</th>
                <th className="py-4 px-6 text-center">Ngày kiểm định</th>
                <th className="py-4 px-6 text-center">Hạn tiếp theo</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm font-bold text-gray-400">Đang tải danh sách kiểm định...</td></tr>
              ) : filteredAssets.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-500 font-medium">Không có thiết bị nào yêu cầu kiểm định.</td></tr>
              ) : (
                filteredAssets.map((asset, index) => (
                  <tr key={asset.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition group">
                    <td className="py-5 px-6 text-center font-bold text-gray-400 text-xs">{index + 1}</td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-gray-900 dark:text-white text-[15px] group-hover:text-blue-600 transition">{asset.name}</span>
                        <span className="text-[12px] text-gray-500 font-bold uppercase tracking-tight mt-0.5">{asset.assetCode}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center font-medium text-gray-600 dark:text-gray-400 italic italic-font">
                      {asset.lastCalibrationDate ? new Date(asset.lastCalibrationDate).toLocaleDateString('en-CA') : '---'}
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`font-extrabold text-[15px] italic italic-font ${
                        asset.nextCalibrationDate && new Date(asset.nextCalibrationDate) < new Date() ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {asset.nextCalibrationDate ? new Date(asset.nextCalibrationDate).toLocaleDateString('en-CA') : '---'}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      {getStatusBadge(asset.nextCalibrationDate)}
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button 
                        onClick={() => { setSelectedAsset(asset); setIsModalOpen(true); }}
                        className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 hover:text-white rounded-lg text-[13px] font-bold transition-all shadow-sm active:scale-95"
                      >
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm font-bold uppercase">Tổng thiết bị</p>
              <h3 className="text-3xl font-black mt-1">{assets.length}</h3>
            </div>
            <Zap className="text-white/40" size={32} />
          </div>
          <p className="text-xs mt-4 text-white/70">Yêu cầu kiểm định định kỳ</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Sắp hết hạn</p>
              <h3 className="text-3xl font-black mt-1 text-orange-500">
                {assets.filter(a => {
                  if (!a.nextCalibrationDate) return false;
                  const diff = new Date(a.nextCalibrationDate).getTime() - new Date().getTime();
                  return diff > 0 && diff < (30 * 24 * 60 * 60 * 1000);
                }).length}
              </h3>
            </div>
            <AlertCircle className="text-orange-500/30" size={32} />
          </div>
          <p className="text-xs mt-4 text-gray-400 font-medium">Trong vòng 30 ngày tới</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 font-medium">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Đã quá hạn</p>
              <h3 className="text-3xl font-black mt-1 text-red-600">
                {assets.filter(a => a.nextCalibrationDate && new Date(a.nextCalibrationDate) < new Date()).length}
              </h3>
            </div>
            <AlertCircle className="text-red-600/30" size={32} />
          </div>
          <p className="text-xs mt-4 text-gray-400 font-medium font-bold">Cần thực hiện ngay</p>
        </div>
      </div>

      <CalibrationUpdateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        asset={selectedAsset}
        onUpdated={fetchAssets}
      />
    </div>
  );
};
