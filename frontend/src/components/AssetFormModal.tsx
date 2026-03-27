import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/client';

export const AssetFormModal = ({ isOpen, onClose, onSaved, assetToEdit }: any) => {
  const [formData, setFormData] = useState<any>({
    assetCode: '', name: '', description: '', equipmentTypeId: '', supplierId: '', departmentId: '', purchasePrice: '', statusId: 0, unit: 'Cái', group: '',
    model: '', serialNumber: '', manufacturer: '', purchaseDate: '', requiresCalibration: false, calibrationCycle: '',
    symbol: '', origin: '', manufactureYear: '', machineCode: '', registrationNumber: '', manualLink: ''
  });
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMasterData();
      if (assetToEdit) {
        setFormData({
          ...assetToEdit,
          equipmentTypeId: assetToEdit.equipmentTypeId || '',
          supplierId: assetToEdit.supplierId || '',
          departmentId: assetToEdit.departmentId || '',
          purchaseDate: assetToEdit.purchaseDate ? assetToEdit.purchaseDate.substring(0, 10) : '',
          statusId: assetToEdit.statusId ?? 0,
          unit: assetToEdit.unit || 'Cái',
          symbol: assetToEdit.symbol || '',
          origin: assetToEdit.origin || '',
          manufactureYear: assetToEdit.manufactureYear || '',
          machineCode: assetToEdit.machineCode || '',
          registrationNumber: assetToEdit.registrationNumber || '',
          manualLink: assetToEdit.manualLink || '',
          group: assetToEdit.group || ''
        });
      } else {
        setFormData({ 
          assetCode: '', name: '', description: '', equipmentTypeId: '', supplierId: '', departmentId: '', purchasePrice: '', statusId: 0, unit: 'Cái', group: '',
          model: '', serialNumber: '', manufacturer: '', purchaseDate: '', requiresCalibration: false, calibrationCycle: '',
          symbol: '', origin: '', manufactureYear: '', machineCode: '', registrationNumber: '', manualLink: ''
        });
      }
    }
  }, [isOpen, assetToEdit]);

  const fetchMasterData = async () => {
    try {
      const res = await apiClient.get('/master/unified');
      const { equipmentTypes, departments, suppliers, statuses } = res.data;
      setEquipmentTypes(equipmentTypes);
      setDepartments(departments);
      setSuppliers(suppliers);
      setStatuses(statuses);
    } catch (e) {
      console.error('Error fetching master data');
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (assetToEdit) {
        await apiClient.put(`/assets/${assetToEdit.id}`, formData);
      } else {
        await apiClient.post('/assets', formData);
      }
      onSaved();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-700/50 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {assetToEdit ? 'Chỉnh sửa Tài sản' : 'Thêm mới Tài sản'}
          </h2>
          <button onClick={onClose} className="p-2.5 bg-gray-100/50 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:bg-gray-700/50 dark:hover:bg-red-500/20 rounded-full transition-all active:scale-95">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tên thiết bị *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium" placeholder="VD: Máy siêu âm..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mã tài sản *</label>
              <input type="text" required value={formData.assetCode} onChange={e => setFormData({...formData, assetCode: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium font-mono text-primary" placeholder="VD: TS-001" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Loại thiết bị *</label>
              <select required value={formData.equipmentTypeId} onChange={e => setFormData({...formData, equipmentTypeId: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium cursor-pointer">
                <option value="">-- Chọn loại thiết bị --</option>
                {equipmentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Khoa / Phòng ban</label>
              <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium cursor-pointer">
                <option value="">Chưa phân bổ</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tình trạng</label>
              <select value={formData.statusId} onChange={e => setFormData({...formData, statusId: Number(e.target.value)})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium cursor-pointer font-bold">
                {statuses.map(s => (
                  <option key={s.matt} value={s.matt}>{s.matt} - {s.tentt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nhà cung cấp</label>
              <select value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium cursor-pointer">
                <option value="">Không bắt buộc</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nhóm thiết bị</label>
              <select value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium cursor-pointer">
                <option value="">-- Chọn nhóm --</option>
                <option value="Thiết bị y tế">Thiết bị y tế</option>
                <option value="Thiết bị CNTT">Thiết bị CNTT</option>
                <option value="Thiết bị hành chính">Thiết bị hành chính</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nguyên giá (VNĐ)</label>
              <input type="number" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Đơn vị tính</label>
              <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium" placeholder="Cái, Bộ, Hệ thống..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Model</label>
              <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Số Serial</label>
              <input type="text" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium text-primary font-mono uppercase" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Hãng sản xuất</label>
              <input type="text" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition font-medium" />
            </div>
            <div className="space-y-2 text-primary">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ký hiệu</label>
              <input type="text" value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nguồn gốc / Xuất xứ</label>
              <input type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Năm sản xuất</label>
              <input type="text" value={formData.manufactureYear} onChange={e => setFormData({...formData, manufactureYear: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mã máy</label>
              <input type="text" value={formData.machineCode} onChange={e => setFormData({...formData, machineCode: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-medium font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Số lưu hành</label>
              <input type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-medium" />
            </div>
            <div className="space-y-2 col-span-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Link HDSD / Tài liệu</label>
              <input type="text" value={formData.manualLink} onChange={e => setFormData({...formData, manualLink: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-medium text-blue-600 underline" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ngày mua</label>
              <input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary outline-none font-medium" />
            </div>

            {/* Calibration details */}
            <div className="col-span-2 bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row gap-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.requiresCalibration} onChange={e => setFormData({...formData, requiresCalibration: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="font-bold text-gray-800 dark:text-gray-200">Yêu cầu kiểm định định kỳ</span>
              </label>
              
              {formData.requiresCalibration && (
                <div className="flex-1 flex items-center gap-3">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 w-44">Chu kỳ kiểm định (Ngày):</label>
                  <input type="number" required value={formData.calibrationCycle} onChange={e => setFormData({...formData, calibrationCycle: e.target.value})} className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary outline-none font-bold" placeholder="VD: 365..." />
                </div>
              )}
            </div>

            <div className="col-span-2 space-y-2 mt-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mô tả chi tiết</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition resize-none font-medium" placeholder="Ghi chú thêm về thiết bị..." />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-8 mt-4 border-t border-gray-100 dark:border-gray-700/50">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all">Huỷ bỏ</button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transform active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100">
              {loading ? 'Đang xử lý...' : 'Lưu Dữ liệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
