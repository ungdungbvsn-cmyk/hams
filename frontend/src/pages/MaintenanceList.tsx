import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Search, Wrench, Download, Filter, CheckCircle2, Eye, Clock } from 'lucide-react';
import { MaintenanceFormModal } from '../components/MaintenanceFormModal';

interface Maintenance {
  id: number;
  code: string;
  name: string;
  assetId: number;
  asset: any;
  creator: any;
  status: string;
  createdAt: string;
}

export const MaintenanceList = () => {
  const [activeTab, setActiveTab] = useState('tickets'); // 'broken' or 'tickets'
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [brokenAssets, setBrokenAssets] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<Maintenance | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tickets') {
        const { data } = await apiClient.get('/maintenances');
        setRecords(data);
      } else {
        const { data } = await apiClient.get('/assets');
        setBrokenAssets(data.filter((a: any) => [1, 2, 4].includes(a.statusId)));
      }
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full text-[11px] uppercase tracking-wider font-extrabold shadow-sm"><CheckCircle2 size={14} /> Đã hoàn thành</span>;
      case 'IN_PROGRESS': return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full text-[11px] uppercase tracking-wider font-extrabold shadow-sm"><Wrench size={14} /> Đang sửa chữa</span>;
      default: return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-full text-[11px] uppercase tracking-wider font-extrabold shadow-sm"><Clock size={14} /> Chờ xử lý</span>;
    }
  };

  const filteredRecords = records.filter(r => 
    (filterStatus === 'ALL' || r.status === filterStatus) &&
    (r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <Wrench className="text-orange-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Sửa chữa</h1>
          <p className="text-gray-500 text-sm mt-0.5">Quản lý báo cáo hỏng hóc và phiếu sửa chữa thiết bị y tế</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
        <h2 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight">Danh sách Sửa chữa</h2>
        <p className="text-gray-500 text-[13px] font-medium mb-6">Xem và quản lý thiết bị báo hỏng và phiếu sửa chữa</p>

        {/* Tabs styled like Segmented Control */}
        <div className="flex bg-gray-50/80 dark:bg-gray-900/80 p-1.5 rounded-xl mb-6 shadow-inner border border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => setActiveTab('broken')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'broken' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700'}`}>
            Danh sách thiết bị báo hỏng
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'tickets' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700'}`}>
            Phiếu sửa chữa
          </button>
        </div>

        {activeTab === 'tickets' && (
          <>
            <div className="flex flex-col lg:flex-row gap-3 mb-6 items-stretch lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm phiếu sửa chữa..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition font-medium"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold appearance-none min-w-[200px] text-gray-700 dark:text-gray-300">
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="IN_PROGRESS">Đang sửa chữa</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm whitespace-nowrap">
                  <Download size={16} /> Xuất báo cáo ({filteredRecords.length})
                </button>
                <button onClick={() => { setRecordToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition whitespace-nowrap">
                  <Plus size={16} /> Tạo Phiếu Sửa chữa
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200/60 dark:border-gray-700/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/80 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold">
                    <th className="py-4 pl-4 pr-4 w-12"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" /></th>
                    <th className="py-4 px-4 text-center w-12">STT</th>
                    <th className="py-4 px-4 whitespace-nowrap">Mã phiếu</th>
                    <th className="py-4 px-4 w-1/3">Tên phiếu</th>
                    <th className="py-4 px-4 whitespace-nowrap text-center">Số lượng thiết bị</th>
                    <th className="py-4 px-4 whitespace-nowrap">Người tạo</th>
                    <th className="py-4 px-4 whitespace-nowrap">Ngày tạo</th>
                    <th className="py-4 px-4 whitespace-nowrap">Trạng thái</th>
                    <th className="py-4 px-4 whitespace-nowrap text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {loading ? (
                    <tr><td colSpan={8} className="py-10 text-center text-sm font-medium text-gray-500">Đang tải dữ liệu...</td></tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-500">Không có dữ liệu phiếu sửa chữa.</td></tr>
                  ) : filteredRecords.map((record, index) => (
                    <tr key={record.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition group">
                      <td className="py-4 pl-4"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" /></td>
                      <td className="py-4 px-4 text-center font-bold text-gray-400 text-[11px]">{index + 1}</td>
                      <td className="py-4 px-4 text-[13px] font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{record.code}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-sm" title={record.name}>{record.name}</td>
                      <td className="py-4 px-4 text-[13px] text-center font-bold text-gray-600 dark:text-gray-400">1</td>
                      <td className="py-4 px-4 text-[13px] font-bold text-gray-700 dark:text-gray-300">{record.creator?.fullName || 'Admin User'}</td>
                      <td className="py-4 px-4 text-[13px] font-medium text-gray-500">{new Date(record.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="py-4 px-4">{getStatusBadge(record.status)}</td>
                      <td className="py-4 px-4 text-right">
                        <button onClick={() => { setRecordToEdit(record); setIsFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" title="Xem / Chỉnh sửa">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'broken' && (
          <div className="overflow-x-auto rounded-xl border border-gray-200/60 dark:border-gray-700/60 mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                  <th className="py-4 px-4 text-center w-12">STT</th>
                  <th className="py-4 px-4 whitespace-nowrap">Thiết bị</th>
                  <th className="py-4 px-4 whitespace-nowrap">Khoa phòng</th>
                  <th className="py-4 px-4 w-1/3">Mô tả hỏng hóc</th>
                  <th className="py-4 px-4 whitespace-nowrap">Trạng thái</th>
                  <th className="py-4 px-4 whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {loading ? (
                  <tr><td colSpan={5} className="py-10 text-center text-sm font-medium text-gray-500">Đang truy vấn trạng thái thiết bị...</td></tr>
                ) : brokenAssets.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-500 font-medium">Hiện không có thiết bị nào trong tình trạng báo hỏng hoặc đang sửa chữa.</td></tr>
                ) : (
                  brokenAssets.map((asset, index) => (
                    <tr key={asset.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition group">
                      <td className="py-4 px-4 text-center font-bold text-gray-400 text-[11px]">{index + 1}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white uppercase text-[12px]">{asset.assetCode}</span>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{asset.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                        {asset.department?.name || 'Chưa rõ'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic italic-font" title={asset.liquidation ? asset.liquidation.reason : (asset.maintenances?.[0]?.description || 'Không có mô tả chi tiết')}>
                           {asset.liquidation ? `Lý do thanh lý: ${asset.liquidation.reason}` : (asset.maintenances?.find((m: any) => m.status === 'PENDING' || m.status === 'IN_PROGRESS')?.description || 'Đã được chuyển sang phiếu sửa chữa')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {asset.liquidation ? (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            asset.liquidation.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                          }`}>
                            {asset.liquidation.status === 'COMPLETED' ? 'ĐÃ THANH LÝ' : 'CHỜ THANH LÝ'}
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            asset.statusId === 1 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                          }`}>
                            {asset.statusId === 1 ? 'BÁO HỎNG' : 'ĐANG SỬA'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {!asset.liquidation && (
                          <button 
                            onClick={() => setActiveTab('tickets')}
                            className="text-primary hover:text-primary-hover font-bold text-sm underline underline-offset-4"
                          >
                            Xử lý
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MaintenanceFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={fetchData} recordToEdit={recordToEdit} />
    </div>
  );
};
