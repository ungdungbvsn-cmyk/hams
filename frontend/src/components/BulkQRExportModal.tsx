import { X, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Asset {
  id: number;
  assetCode: string;
  name: string;
  department?: { name: string };
  qrCode?: string;
}

interface BulkQRExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
}

export const BulkQRExportModal = ({ isOpen, onClose, assets }: BulkQRExportModalProps) => {
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col relative border border-white/10 print:h-auto print:shadow-none print:border-none print:rounded-none">
        
        {/* Header - Hidden on Print */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center print:hidden">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Xuất mã QR Tài sản</h2>
            <p className="text-gray-500 text-sm font-medium">Xem trước và in mã QR cho {assets.length} thiết bị</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
            >
              <Printer size={20} /> In mã QR
            </button>
            <button onClick={onClose} className="p-2.5 bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:bg-gray-700 dark:hover:bg-red-500/20 rounded-xl transition">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 bg-gray-50 dark:bg-gray-900/50 print:bg-white">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4 print:block">
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center shadow-sm print:shadow-none print:border-gray-300 print:mb-4 print:break-inside-avoid print:inline-flex print:w-[45%] print:mr-[2%] print:p-4"
              >
                <div className="p-2 bg-white rounded-lg border border-gray-100 mb-4">
                  <QRCodeSVG value={asset.qrCode || `asset-${asset.id}`} size={140} level="M" />
                </div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center mb-1">
                  HAMS-{asset.assetCode}
                </p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white text-center line-clamp-2 min-h-[40px]">
                  {asset.name}
                </h3>
                {asset.department && (
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-2">
                    {asset.department.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Hidden on Print */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center print:hidden">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Sử dụng giấy A4 để có kết quả in tốt nhất</p>
        </div>
      </div>
    </div>
  );
};
