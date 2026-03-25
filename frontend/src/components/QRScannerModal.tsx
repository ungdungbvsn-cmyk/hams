import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal = ({ isOpen, onClose }: QRScannerModalProps) => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    async function onScanSuccess(decodedText: string) {
      scanner.clear();
      try {
        // Try to parse 'asset-ID' pattern first
        if (decodedText.startsWith('asset-')) {
          const id = decodedText.split('-')[1];
          navigate(`/assets/${id}`);
          onClose();
          return;
        }

        // Fetch assets to find matching qrCode or assetCode
        const { data } = await apiClient.get('/assets');
        const match = data.find((a: any) => a.qrCode === decodedText || a.assetCode === decodedText);
        if (match) {
          navigate(`/assets/${match.id}`);
          onClose();
        } else {
          setErrorMsg('Không tìm thấy tài sản với mã QR này trong hệ thống.');
          // Restart scanner after 3s manually or let user retry
        }
      } catch (err) {
        setErrorMsg('Lỗi xử lý. Vui lòng thử lại.');
      }
    }

    function onScanFailure() {
      // ignore verbose errors from html5-qrcode
    }

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Quét Mã QR
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}
          <div id="qr-reader" className="overflow-hidden rounded-xl border-2 border-primary/20 bg-gray-50 dark:bg-gray-900"></div>
          <p className="text-center text-sm font-medium text-gray-500 mt-4">
            Đưa Camera quét mã QR được dán trên tài sản/thiết bị để truy xuất thông tin nhanh.
          </p>
        </div>
      </div>
    </div>
  );
};
