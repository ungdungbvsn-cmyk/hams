import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Calendar, Save, ClipboardList, Filter, RotateCcw, History } from 'lucide-react';

interface Employee {
  id: number;
  fullName: string;
  department?: { name: string };
  timekeepingRecords?: any[];
}

interface Symbol {
  id: number;
  code: string;
  name: string;
}

export const TimekeepingList = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPrev, setLoadingPrev] = useState(false);
  
  // Local state for edits
  const [records, setRecords] = useState<Record<number, { symbolId: string, overtimeHours: string }>>({});

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchTimekeeping();
  }, [date, selectedDept]);

  const fetchMasterData = async () => {
    try {
      const [symRes, depRes] = await Promise.all([
        apiClient.get('/timekeeping-symbols'),
        apiClient.get('/master/departments')
      ]);
      setSymbols(symRes.data);
      setDepartments(depRes.data);
    } catch (error) {
      console.error('Failed to fetch master data');
    }
  };

  const fetchTimekeeping = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/timekeeping`, {
        params: { date, departmentId: selectedDept }
      });
      setEmployees(data);
      
      const initialRecords: any = {};
      data.forEach((emp: any) => {
        const existingRec = emp.timekeepingRecords?.[0];
        initialRecords[emp.id] = {
          symbolId: existingRec?.symbolId?.toString() || '',
          overtimeHours: existingRec?.overtimeHours?.toString() || '0'
        };
      });
      setRecords(initialRecords);
    } catch (error) {
      console.error('Failed to fetch timekeeping data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = (empId: number, field: string, value: string) => {
    setRecords(prev => ({
      ...prev,
      [empId]: { ...prev[empId], [field]: value }
    }));
  };

  const handleQuickMarkAll = () => {
    const plusSymbol = symbols.find(s => s.code === '+');
    if (!plusSymbol) {
      alert('Không tìm thấy ký hiệu chấm công "+". Vui lòng kiểm tra lại cấu hình.');
      return;
    }
    
    setRecords(prev => {
      const newRecords = { ...prev };
      employees.forEach(emp => {
        newRecords[emp.id] = {
          symbolId: plusSymbol.id.toString(),
          overtimeHours: prev[emp.id]?.overtimeHours || '0'
        };
      });
      return newRecords;
    });
  };

  const handleResetAll = () => {
    const resetRecords: any = {};
    employees.forEach(emp => {
      resetRecords[emp.id] = {
        symbolId: '',
        overtimeHours: '0'
      };
    });
    setRecords(resetRecords);
  };

  const handleLoadPreviousDay = async () => {
    setLoadingPrev(true);
    try {
      const { data } = await apiClient.get('/timekeeping/previous-day', {
        params: { date, departmentId: selectedDept }
      });

      if (!data.records || data.records.length === 0) {
        alert('Không tìm thấy dữ liệu chấm công của ngày trước đó.');
        return;
      }

      setRecords(prev => {
        const newRecords = { ...prev };
        data.records.forEach((rec: any) => {
          if (newRecords[rec.employeeId]) {
            newRecords[rec.employeeId] = {
              symbolId: rec.symbolId.toString(),
              overtimeHours: rec.overtimeHours.toString()
            };
          }
        });
        return newRecords;
      });

      alert(`Đã tải dữ liệu từ ngày: ${new Date(data.date).toLocaleDateString('vi-VN')}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi tải dữ liệu ngày trước');
    } finally {
      setLoadingPrev(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const batchData = Object.entries(records).map(([empId, data]) => ({
        employeeId: Number(empId),
        symbolId: data.symbolId ? Number(data.symbolId) : null,
        overtimeHours: Number(data.overtimeHours)
      }));

      if (batchData.length === 0) {
        alert('Không có dữ liệu để lưu');
        return;
      }

      await apiClient.post('/timekeeping/batch', {
        date,
        records: batchData
      });
      alert('Đã lưu dữ liệu chấm công thành công!');
      fetchTimekeeping();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <ClipboardList size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Chấm công Nhân viên</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium italic">Tối ưu hóa quy trình quản lý chuyên cần hàng ngày</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
                <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" />
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-primary/50 rounded-2xl font-bold shadow-inner outline-none transition"
                />
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-inner">
                <button 
                    onClick={handleLoadPreviousDay} 
                    disabled={loadingPrev || employees.length === 0}
                    title="Tải lại trạng thái từ ngày gần nhất"
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 text-sm"
                >
                    <History size={18} /> {loadingPrev ? 'Đang tải...' : 'Load ngày trước'}
                </button>

                <button 
                    onClick={handleResetAll} 
                    disabled={employees.length === 0}
                    title="Xóa tất cả các lựa chọn hiện tại"
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 text-sm"
                >
                    <RotateCcw size={18} /> Reset All
                </button>
            </div>

            <button 
                onClick={handleQuickMarkAll} 
                disabled={loading || employees.length === 0}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
                Chấm công Nhanh (+)
            </button>

            <button 
                onClick={handleSave} 
                disabled={saving || loading}
                className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-green-500/30 transition-all hover:-translate-y-1"
            >
                <Save size={20} /> {saving ? 'Đang lưu...' : 'Lưu tất cả'}
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden overflow-y-auto">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-sm font-black text-gray-700 dark:text-gray-300 uppercase">
                    <Filter size={20} className="text-primary" /> Lọc Khoa phòng:
                </div>
                <select 
                    value={selectedDept} 
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary/30 rounded-xl text-sm font-bold shadow-sm outline-none transition cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <option value="">Tất cả khoa phòng</option>
                    {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>
            <div className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-full uppercase tracking-widest">
                Đang hiển thị: {employees.length} Nhân sự
            </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-700">
                <th className="py-5 px-6 text-center w-16">STT</th>
                <th className="py-5 px-6">Họ tên & ID</th>
                <th className="py-5 px-6">Đơn vị công tác</th>
                <th className="py-5 px-6 w-64">Trạng thái chấm công</th>
                <th className="py-5 px-6 w-32 text-center">Tăng ca (Giờ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center text-gray-400 font-black animate-pulse text-lg uppercase tracking-widest">Hệ thống đang đồng bộ dữ liệu...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-gray-500 font-bold italic">Không có dữ liệu nhân sự để hiển thị.</td></tr>
              ) : employees.map((emp, index) => {
                return (
                  <tr key={emp.id} className="transition duration-300 group hover:bg-gray-50/70 dark:hover:bg-gray-700/20">
                    <td className="py-5 px-6 text-center font-mono font-black text-gray-300 group-hover:text-primary transition-colors">{index + 1}</td>
                    <td className="py-5 px-6">
                      <div className="font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{emp.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-black mt-0.5 tracking-widest uppercase">Mã NV: {emp.id}</div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100/50 dark:border-blue-700/50 shadow-sm">
                        {emp.department?.name || 'Vãng lai'}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                        <select 
                            required
                            value={records[emp.id]?.symbolId || ''}
                            onChange={(e) => handleUpdateRecord(emp.id, 'symbolId', e.target.value)}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary/30 rounded-xl text-sm font-black shadow-inner outline-none transition-all cursor-pointer hover:bg-white dark:hover:bg-gray-800"
                        >
                            <option value="">-- Chọn trạng thái --</option>
                            {symbols.map(s => (
                                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                            ))}
                        </select>
                    </td>
                    <td className="py-5 px-6">
                        <input 
                            type="number" 
                            step="0.5"
                            min="0"
                            value={records[emp.id]?.overtimeHours || '0'}
                            onChange={(e) => handleUpdateRecord(emp.id, 'overtimeHours', e.target.value)}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary/30 rounded-xl text-sm font-black shadow-inner outline-none text-center transition-all hover:bg-white dark:hover:bg-gray-800"
                        />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
