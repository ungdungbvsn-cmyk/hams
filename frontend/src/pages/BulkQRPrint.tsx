import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BulkQRPrint = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data } = await apiClient.get('/assets');
      setAssets(data);
    } catch (error) {
      console.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center font-bold">Đang tải danh sách mã QR...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      {/* Controls - Hidden on Print */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate('/assets')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition font-bold"
        >
          <ArrowLeft size={20} /> Quay lại danh sách
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <Printer size={20} /> In tất cả mã QR
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-6">
          {assets.map((asset) => (
            <div 
              key={asset.id} 
              className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-center shadow-sm print:shadow-none print:border-gray-300 print:break-inside-avoid"
              style={{ minHeight: '180px' }}
            >
              <div className="mb-2">
                <QRCodeSVG value={asset.qrCode || `asset-${asset.id}`} size={100} level="M" />
              </div>
              <p className="text-[10px] font-bold text-gray-900 uppercase truncate w-full mb-1">
                {asset.name}
              </p>
              <p className="text-[9px] font-mono text-gray-500 tracking-tighter">
                HAMS-{asset.assetCode}
              </p>
              <p className="text-[8px] text-gray-400 mt-1">
                {asset.department?.name || '---'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .min-h-screen { background: white !important; padding: 0 !important; }
          @page { margin: 1cm; size: A4; }
          .max-w-6xl { max-width: none !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};
