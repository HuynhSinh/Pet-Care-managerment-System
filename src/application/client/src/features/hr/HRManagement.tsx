import { useState } from 'react';
import {
    Briefcase, MapPin, Search, Plus, Trash2, Edit, Download
} from 'lucide-react';

// Mock Data simulating NHAN_VIEN Schema
// Columns: MaNV, HoTen, NgaySinh, GioiTinh, NgayVaoLam, LuongCoBan, ChucVu, MaCN
const generateEmployees = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        MaNV: i + 1,
        HoTen: `Nhân viên ${i + 1}`,
        GioiTinh: i % 2 === 0 ? 'Nam' : 'Nữ',
        ChucVu: i % 4 === 0 ? 'Bác sĩ' : i % 3 === 0 ? 'Groomer' : i % 2 === 0 ? 'Quản lý' : 'Tiếp tân',
        MaCN: i % 2 === 0 ? 'CN Trung Tâm' : 'CN Phía Tây',
        NgayVaoLam: '2023-01-15',
        LuongCoBan: `${(Math.floor(Math.random() * 10) + 5)}000000`, // Simulated salary
        KPI: Math.floor(Math.random() * 30) + 70 // Virtual field for evaluation
    }));
};

const allEmployees = generateEmployees(40);

export default function HRManagement() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(allEmployees.length / itemsPerPage);
    const currentData = allEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatCurrency = (val: string) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(val));
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-[#333333]">Nhân Sự (NHAN_VIEN)</h2>
                    <p className="text-xs text-slate-500">Quản lý hồ sơ & Lương cơ bản</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-600">
                        <Download size={16} /> Export
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm nhân viên..."
                            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0056b3] w-64 shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-[#0056b3] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-500/20">
                        <Plus size={16} /> Thêm Mới
                    </button>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Fixed Header */}
                <div className="bg-slate-100 border-b border-slate-200 shrink-0">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-slate-600 font-bold text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 w-[10%]">Mã NV</th>
                                <th className="px-6 py-4 w-[25%]">Họ Tên & Giới tính</th>
                                <th className="px-6 py-4 w-[20%]">Chức vụ & CN</th>
                                <th className="px-6 py-4 w-[15%]">Ngày vào làm</th>
                                <th className="px-6 py-4 w-[15%] text-right">Lương Cơ Bản</th>
                                <th className="px-6 py-4 w-[15%] text-right">KPI (Task)</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left table-fixed">
                        <tbody className="divide-y divide-slate-100">
                            {currentData.map((emp) => (
                                <tr key={emp.MaNV} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4 w-[10%] font-mono text-slate-500 text-sm">NV{emp.MaNV}</td>
                                    <td className="px-6 py-4 w-[25%]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                                                {emp.HoTen.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#333333] text-sm">{emp.HoTen}</div>
                                                <div className="text-xs text-slate-500">{emp.GioiTinh}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 w-[20%]">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                            <Briefcase size={14} className="text-[#0056b3]" /> {emp.ChucVu}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <MapPin size={12} /> {emp.MaCN}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 w-[15%] text-sm text-slate-600">
                                        {emp.NgayVaoLam}
                                    </td>
                                    <td className="px-6 py-4 w-[15%] text-right font-mono text-slate-700 font-medium text-sm">
                                        {formatCurrency(emp.LuongCoBan)}
                                    </td>
                                    <td className="px-6 py-4 w-[15%] text-right">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${emp.KPI >= 90 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {emp.KPI}/100
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                <div className="text-xs text-slate-500 font-medium">Trang {currentPage} / {totalPages}</div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50 text-xs font-medium"
                    >
                        Trước
                    </button>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50 text-xs font-medium"
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
}
