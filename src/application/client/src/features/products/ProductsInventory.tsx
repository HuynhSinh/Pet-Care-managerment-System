import { Package, Smartphone, AlertTriangle, Plus, Search } from 'lucide-react';
import { useState } from 'react';

// Mock Data simulating SAN_PHAM Schema
// Columns: MaSP, TenSP, LoaiSP, GiaBan, SoLuongTonKho
const generateInventory = () => {
    return Array.from({ length: 45 }, (_, i) => ({
        MaSP: i + 1,
        TenSP: `Sản phẩm ${i + 1} ${i % 2 === 0 ? '- Royal Canin' : '- Zenith'}`,
        LoaiSP: i % 3 === 0 ? 'Thức ăn' : i % 2 === 0 ? 'Phụ kiện' : 'Thuốc',
        GiaBan: (Math.floor(Math.random() * 10) + 1) * 50000,
        SoLuongTonKho: Math.floor(Math.random() * 200)
    }));
};

const allInventory = generateInventory();

export default function ProductsInventory() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(allInventory.length / itemsPerPage);
    const currentData = allInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    }

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">

            {/* Top: Stats (derived from SAN_PHAM / HOA_DON) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-[#0056b3] rounded"><Smartphone size={24} /></div>
                    <div>
                        <div className="text-lg font-bold text-[#333333]">150 SP</div>
                        <div className="text-xs text-slate-500">Tổng Danh Mục (LoaiSP)</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded"><Package size={24} /></div>
                    <div>
                        <div className="text-lg font-bold text-[#333333]">{allInventory.reduce((acc, cur) => acc + cur.SoLuongTonKho, 0)}</div>
                        <div className="text-xs text-slate-500">Tổng Tồn Kho (Unit)</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-600 rounded"><AlertTriangle size={24} /></div>
                    <div>
                        <div className="text-lg font-bold text-[#333333]">{allInventory.filter(i => i.SoLuongTonKho < 20).length} mã</div>
                        <div className="text-xs text-slate-500">Cảnh báo Tồn thấp</div>
                    </div>
                </div>
            </div>

            {/* Bottom: Inventory Grid (Full Height) */}
            <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-bold text-[#333333]">Kho Hàng (SAN_PHAM)</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2 text-slate-400 w-4 h-4" />
                            <input className="pl-8 py-1.5 border border-slate-200 rounded text-sm w-48 focus:outline-none focus:border-blue-500" placeholder="Tìm sản phẩm..." />
                        </div>
                        <button className="bg-[#0056b3] text-white px-3 rounded hover:bg-blue-700 transition flex items-center gap-1 text-sm font-medium"><Plus size={16} /> Nhập Kho</button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="border-b border-slate-200 bg-slate-100 shrink-0">
                        <table className="w-full text-left table-fixed">
                            <thead className="text-slate-500 font-semibold text-xs uppercase">
                                <tr>
                                    <th className="p-4 w-[10%]">Mã SP</th>
                                    <th className="p-4 w-[35%]">Tên Sản Phẩm</th>
                                    <th className="p-4 w-[20%]">Loại (LoaiSP)</th>
                                    <th className="p-4 w-[20%] text-right">Giá Bán</th>
                                    <th className="p-4 w-[15%] text-center">Tồn Kho</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    {/* Scroll Body */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left table-fixed">
                            <tbody className="divide-y divide-slate-100">
                                {currentData.map(item => (
                                    <tr key={item.MaSP} className="hover:bg-slate-50">
                                        <td className="p-4 w-[10%] font-mono text-slate-500 text-sm">SP{item.MaSP}</td>
                                        <td className="p-4 w-[35%] font-medium text-[#333333] truncate">{item.TenSP}</td>
                                        <td className="p-4 w-[20%]">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{item.LoaiSP}</span>
                                        </td>
                                        <td className="p-4 w-[20%] text-right font-bold text-[#0056b3]">{formatCurrency(item.GiaBan)}</td>
                                        <td className={`p-4 w-[15%] text-center font-bold ${item.SoLuongTonKho < 20 ? 'text-red-500 bg-red-50 rounded' : 'text-slate-700'}`}>
                                            {item.SoLuongTonKho}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                    <div className="text-xs text-slate-500">Trang {currentPage} / {totalPages}</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50 text-xs"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50 text-xs"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
