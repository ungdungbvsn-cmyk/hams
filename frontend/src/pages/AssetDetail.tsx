import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '../api/client';
import { ArrowLeft, Edit, Activity, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/useAuthStore';
import { AssetFormModal } from '../components/AssetFormModal';
import { TransferAssetModal } from '../components/TransferAssetModal';

export const AssetDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const hasAccessMaintenance = user?.role?.name === 'ADMIN' || (user?.permissions as any)?.accessMaintenance;
  const [asset, setAsset] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  const isLiquidationAllowed = hasAccessMaintenance && asset && (asset.statusId === 1);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);

  // Liquidation State
  const [isLiquidating, setIsLiquidating] = useState(false);
  const [liquidationReason, setLiquidationReason] = useState('');

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const fetchAsset = async () => {
    try {
      const { data } = await apiClient.get(`/assets/${id}`);
      setAsset(data);
    } catch (error) {
      console.error('Failed to fetch asset');
    } finally {
      setLoading(false);
    }
  };

  const getAiInsight = async () => {
    setInsightLoading(true);
    try {
      const { data } = await apiClient.post('/ai/insights', { assetId: id });
      setAiInsight(data.insight);
    } catch (error: any) {
      console.error('AI Insight Error');
      setAiInsight('Không thể lấy phân tích AI lúc này: ' + (error.response?.data?.error || 'Lỗi hệ thống'));
    } finally {
      setInsightLoading(false);
    }
  };



  const handleLiquidationSubmit = async (e: any) => {
    e.preventDefault();
    if (!liquidationReason) return alert("Vui lòng nhập lý do thanh lý.");
    try {
      await apiClient.post(`/assets/${id}/liquidate`, { reason: liquidationReason });
      setIsLiquidating(false);
      setLiquidationReason('');
      fetchAsset();
    } catch (err: any) {
      alert("Lỗi đưa vào thanh lý: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải biểu mẫu tài sản...</div>;
  if (!asset) return <div className="p-8 text-center text-red-500">Không tìm thấy tài sản.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link to="/assets" className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm border border-gray-100 dark:border-gray-700">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            {asset.name}
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs rounded-full uppercase tracking-wider font-bold">
              {asset.statusConfig?.tentt || '---'}
            </span>
          </h1>
          <p className="text-gray-500 mt-1 font-mono text-sm">{asset.assetCode} • {asset.category?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
            <div className="flex justify-between items-center mb-6 pl-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin cơ bản</h2>
              <div className="flex items-center gap-3">
                {(user?.role?.name === 'ADMIN' || (user?.permissions as any)?.accessMovement) && (
                  <button 
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
                  >
                    <RefreshCw size={16} /> Luân chuyển
                  </button>
                )}
                {(user?.role?.name === 'ADMIN' || (user?.permissions as any)?.manageAssets) && (
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition"
                  >
                    <Edit size={16} /> Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 pl-2">
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Khoa / Phòng ban</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-1">{asset.department?.name || 'Chưa bàn giao'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Nhà cung cấp</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-1">{asset.supplier?.name || '---'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Đơn vị tính</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-1">{asset.unit || 'Cái'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Ngày mua</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-1">{asset.purchaseDate ? format(new Date(asset.purchaseDate), 'dd/MM/yyyy') : '---'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Nguyên giá</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-1">{asset.purchasePrice ? `${asset.purchasePrice.toLocaleString()} VNĐ` : '---'}</p>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 mt-2">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ký hiệu</p>
                  <p className="font-bold text-primary mt-0.5">{asset.symbol || '---'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nguồn gốc</p>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{asset.origin || '---'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Năm sản xuất</p>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{asset.manufactureYear || '---'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mã máy / Model</p>
                  <p className="font-mono text-gray-900 dark:text-white mt-0.5">{asset.machineCode || asset.model || '---'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Số lưu hành</p>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{asset.registrationNumber || '---'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tài liệu / HDSD</p>
                  {asset.manualLink ? (
                    <a href={asset.manualLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-bold mt-0.5 block truncate underline">Xem tài liệu</a>
                  ) : (
                    <p className="text-gray-400 mt-0.5 italic">Chưa có link</p>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Mô tả</p>
                <p className="font-medium text-gray-700 dark:text-gray-300 mt-1">{asset.description || 'Không có mô tả chi tiết.'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Activity className="text-primary"/> AI Insights</h2>
              <button onClick={getAiInsight} disabled={insightLoading} className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                {insightLoading ? 'Đang phân tích...' : 'Phân tích Tình trạng'}
              </button>
            </div>
            {aiInsight ? (
              <div className="p-6 bg-white dark:bg-gray-900/50 border border-primary/20 rounded-xl relative z-10 shadow-sm">
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-medium">{aiInsight}</p>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 relative z-10">
                Bấm vào nút trên để lấy báo cáo dự báo từ Gemini AI.
              </div>
            )}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Right Col - QR & Traceability */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 w-full text-center border-b border-gray-100 dark:border-gray-700 pb-4">Mã QR</h2>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
               <QRCodeSVG value={asset.qrCode || `asset-${asset.id}`} size={160} level="M" />
            </div>
            <p className="mt-5 font-mono text-sm font-bold tracking-widest text-gray-600 dark:text-gray-400">HAMS-{asset.assetCode}</p>
          </div>



          {isLiquidationAllowed && (
            <div className={`rounded-2xl shadow-sm border p-6 transition-all ${isLiquidating ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsLiquidating(!isLiquidating)}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Trash2 size={18} className="text-red-500"/> Đưa vào Thanh lý</h2>
                <div className={`w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer transition-colors ${isLiquidating ? 'bg-red-500 dark:bg-red-500' : ''}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isLiquidating ? 'translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              {isLiquidating && (
                <form onSubmit={handleLiquidationSubmit} className="mt-6 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Lý do thanh lý *</label>
                    <textarea value={liquidationReason} onChange={e => setLiquidationReason(e.target.value)} className="w-full text-sm p-3 rounded-xl bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 font-medium" rows={3} placeholder="Mô tả lý do thanh lý thiết bị..." required />
                  </div>
                  <button type="submit" className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-md shadow-red-600/20">Xác nhận Đưa vào Thanh lý</button>
                </form>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Lịch sử Biến động</h2>
            <div className="space-y-6">
              {asset.histories?.length === 0 ? (
                <p className="text-gray-500 text-sm italic text-center py-4">Chưa có biến động.</p>
              ) : (
                asset.histories?.slice(0, 5).map((history: any, idx: number) => (
                  <div key={history.id} className="relative pl-6 pb-2">
                    {idx !== asset.histories.slice(0, 5).length - 1 && (
                      <div className="absolute left-[5px] top-6 w-[2px] h-full bg-gray-100 dark:bg-gray-700"></div>
                    )}
                    <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 border-2 border-primary rounded-full left-0 top-1.5 z-10"></div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wide">{history.actionType}</p>
                    <p className="text-xs font-medium text-primary mt-1">{format(new Date(history.date), 'dd/MM/yyyy HH:mm')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">{history.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AssetFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        assetToEdit={asset}
        onSaved={fetchAsset}
      />
      <TransferAssetModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        asset={asset}
        onSaved={fetchAsset}
      />
    </div>
  );
};
