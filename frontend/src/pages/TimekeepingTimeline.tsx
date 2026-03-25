import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Users, Filter, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface TimelineData {
  id: number;
  fullName: string;
  department: string;
  records: Record<number, string>; // day -> symbolCode
}

export const TimekeepingTimeline = () => {
  const user = useAuthStore(state => state.user);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDept, setSelectedDept] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [data, setData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [month, year, selectedDept]);

  const fetchDepartments = async () => {
    try {
      const { data } = await apiClient.get('/departments');
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/timekeeping/timeline', {
        params: { month, year, departmentId: selectedDept }
      });
      setData(data);
    } catch (error) {
      console.error('Failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [month, year, selectedDept]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayName = (day: number) => {
    const d = new Date(year, month - 1, day);
    const names = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return names[d.getDay()];
  };

  const isWeekend = (day: number) => {
    const d = new Date(year, month - 1, day);
    return d.getDay() === 0 || d.getDay() === 6;
  };

  const handleDownloadExcelOnly = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Bang_Cham_Cong');

    const lastColIndex = days.length + 2; 

    // 1. Headers Left
    ws.mergeCells('A1:D1');
    const h1 = ws.getCell('A1');
    h1.value = 'BỆNH VIỆN SẢN - NHI TỈNH HƯNG YÊN';
    h1.font = { bold: true, size: 11 };

    ws.mergeCells('A2:D2');
    const deptName = selectedDept ? departments.find(d => d.id === Number(selectedDept))?.name : 'Tất cả khoa phòng';
    const h2 = ws.getCell('A2');
    h2.value = `KHOA/PHÒNG: ${deptName}`;
    h2.font = { bold: true, size: 11 };

    // 2. Headers Right
    const rightHeaderColStart = lastColIndex - 8 > 5 ? lastColIndex - 8 : 5;
    ws.mergeCells(1, rightHeaderColStart, 1, lastColIndex);
    const m1 = ws.getCell(1, rightHeaderColStart);
    m1.value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
    m1.alignment = { horizontal: 'center' };
    m1.font = { bold: true, size: 11 };

    ws.mergeCells(2, rightHeaderColStart, 2, lastColIndex);
    const m2 = ws.getCell(2, rightHeaderColStart);
    m2.value = 'Độc lập - Tự do - Hạnh phúc';
    m2.alignment = { horizontal: 'center' };
    m2.font = { bold: true, underline: true, size: 11 };

    // 3. Title
    ws.mergeCells(4, 1, 4, lastColIndex);
    const title = ws.getCell(4, 1);
    title.value = `BẢNG CHẤM CÔNG THÁNG ${month}/${year}`;
    title.alignment = { horizontal: 'center' };
    title.font = { bold: true, size: 16 };

    // 4. Table Headers
    const headerRowObj = ws.getRow(6);
    headerRowObj.getCell(1).value = 'STT';
    headerRowObj.getCell(2).value = 'Họ và tên';
    days.forEach((d, i) => {
      const cell = headerRowObj.getCell(i + 3);
      cell.value = `${d}\n${getDayName(d)}`;
      cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
    });
    headerRowObj.height = 30;

    // 5. Data Rows
    data.forEach((emp, index) => {
      const rowObj = ws.getRow(7 + index);
      rowObj.getCell(1).value = index + 1;
      rowObj.getCell(2).value = emp.fullName;
      days.forEach((d, i) => {
        const cell = rowObj.getCell(i + 3);
        cell.value = emp.records[d] || '';
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    // 6. Formatting
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    for (let r = 6; r <= 6 + data.length; r++) {
      const row = ws.getRow(r);
      for (let c = 1; c <= lastColIndex; c++) {
        const cell = row.getCell(c);
        cell.border = borderStyle;
        
        if (r === 6) {
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }; // Light gray header
        }
        
        // Yellow for weekends
        if (c > 2) {
          const day = c - 2;
          if (isWeekend(day)) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
          }
        }
      }
    }

    // 7. Column Widths
    ws.getColumn(1).width = 5;
    ws.getColumn(2).width = 30;
    for(let c = 3; c <= lastColIndex; c++) {
      ws.getColumn(c).width = 6;
    }

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Bang_Cham_Cong_Thang_${month}_${year}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
            <Users size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Timeline Chấm công</h1>
            <p className="text-gray-500 text-sm mt-0.5">Theo dõi chuyên cần chi tiết theo tháng</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-gray-100 dark:border-gray-700">
            <button onClick={() => { if(month === 1) { setMonth(12); setYear(year-1); } else setMonth(month-1); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"><ChevronLeft size={18} /></button>
            <span className="font-bold text-sm min-w-[100px] text-center text-indigo-600">Tháng {month} / {year}</span>
            <button onClick={() => { if(month === 12) { setMonth(1); setYear(year+1); } else setMonth(month+1); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"><ChevronRight size={18} /></button>
          </div>

          <div className="flex items-center gap-2 px-3 border-r border-gray-100 dark:border-gray-700">
            <Filter size={16} className="text-gray-400" />
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

          <button 
            onClick={handleDownloadExcelOnly}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-green-600/20"
          >
            <FileSpreadsheet size={16} /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-mono">
                <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 p-4 font-bold text-[10px] uppercase w-12 text-center border-r border-gray-100 dark:border-gray-700">STT</th>
                <th className="sticky left-12 z-20 bg-gray-50 dark:bg-gray-900 p-4 font-bold text-[10px] uppercase w-48 border-r border-gray-100 dark:border-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Họ và tên</th>
                {days.map(d => (
                  <th key={d} className={`p-2 text-center border-r border-gray-100 dark:border-gray-700 w-10 ${isWeekend(d) ? 'bg-red-200 dark:bg-red-900/50' : ''}`}>
                    <div className="text-[10px] font-black">{getDayName(d)}</div>
                    <div className="text-xs font-black text-gray-900 dark:text-white mt-0.5">{d}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={days.length + 2} className="p-20 text-center font-bold text-gray-400 animate-pulse font-mono uppercase">Hệ thống đang tổng hợp dữ liệu chấm công...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={days.length + 2} className="p-20 text-center text-gray-400 font-medium italic">Không có dữ liệu chấm công trong tháng này.</td></tr>
              ) : (
                currentData.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition group">
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 p-4 text-center font-bold text-gray-400 text-xs border-r border-gray-100 dark:border-gray-700">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="sticky left-12 z-10 bg-white dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 p-4 border-r border-gray-100 dark:border-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{emp.fullName}</p>
                    </td>
                    {days.map(d => {
                      const dayRecord = emp.records?.[d];
                      return (
                        <td key={d} className={`p-2 text-center border-r border-gray-100 dark:border-gray-700 text-sm font-black ${isWeekend(d) ? 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100' : ''}`}>
                           <span className={dayRecord ? 'text-primary dark:text-primary-light font-bold' : 'text-gray-200'}>
                             {dayRecord || '--'}
                           </span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20">
            <div className="text-xs text-gray-500 font-bold uppercase">
              Đang hiển thị <span className="text-primary">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, data.length)}</span> / <span className="text-primary">{data.length}</span> nhân viên
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold disabled:opacity-30 transition"
              >
                Trang trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold disabled:opacity-30 transition"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
