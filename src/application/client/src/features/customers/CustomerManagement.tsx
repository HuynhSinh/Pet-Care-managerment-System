import { Crown, TrendingUp, Search, User, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';
import { useState } from 'react';

// Mock Data based on KHACH_HANG schema
// Fields: MaKH, TenKH, SDT, Email, CCCD, GioiTinh, NgaySinh, DiemLoyalty, MaHang
const generateCustomers = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        MaKH: i + 1,
        TenKH: `Khách Hàng ${i + 1}`,
        SDT: `090${Math.floor(Math.random() * 10000000).toString().padEnd(7, '0')}`,
        Email: `user${i}@example.com`,
        CCCD: `079${Math.floor(Math.random() * 1000000000).toString().padEnd(9, '0')}`,
        GioiTinh: i % 2 === 0 ? 'Nam' : 'Nữ',
        DiemLoyalty: Math.floor(Math.random() * 5000),
        MaHang: i % 10 === 0 ? 'VIP' : i % 5 === 0 ? 'Thân thiết' : 'Thành viên', // Mapping from ID
        ChiTieu: `${(Math.random() * 20).toFixed(1)}tr` // Derived from HOA_DON
    }));
};

const allCustomers = generateCustomers(50);

export default function CustomerManagement() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // Adjusted for full screen fit
    const totalPages = Math.ceil(allCustomers.length / itemsPerPage);

    const currentData = allCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="h-full flex gap-4 overflow-hidden">
            {/* Left: Customer List Main Area (Full Height, No Global Scroll) */}
            <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-bold text-[#333333] text-lg">Khách Hàng (KHACH_HANG)</h3>
                        <p className="text-xs text-slate-500">Quản lý tài khoản & hạng thành viên</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-600">
                            <Download size={16} /> Export
                        </button>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4" />
                            <input className="pl-9 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500" placeholder="Tìm tên, SĐT, CCCD..." />
                        </div>
                    </div>
                </div>

                {/* Table Container - Flex Grow to take available space */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Sticky Header */}
                    <div className="bg-slate-100 border-b border-slate-200 shrink-0">
                        <table className="w-full text-left table-fixed">
                            <thead className="text-slate-500 text-xs font-bold uppercase">
                                <tr>
                                    <th className="p-4 w-[10%]">Mã KH</th>
                                    <th className="p-4 w-[20%]">Họ Tên</th>
                                    <th className="p-4 w-[15%]">SĐT / CCCD</th>
                                    <th className="p-4 w-[10%]">Giới Tính</th>
                                    <th className="p-4 w-[15%]">Hạng (MaHang)</th>
                                    <th className="p-4 w-[15%] text-right">Điểm Loyalty</th>
                                    <th className="p-4 w-[15%] text-right">Tổng Chi Tiêu</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left table-fixed">
                            <tbody className="divide-y divide-slate-100">
                                {currentData.map(c => (
                                    <tr key={c.MaKH} className="hover:bg-blue-50/30 cursor-pointer transition-colors text-sm">
                                        <td className="p-4 w-[10%] font-mono text-slate-500">#{c.MaKH}</td>
                                        <td className="p-4 w-[20%] font-bold text-[#333333]">{c.TenKH}</td>
                                        <td className="p-4 w-[15%]">
                                            <div className="text-slate-700">{c.SDT}</div>
                                            <div className="text-xs text-slate-400">{c.CCCD}</div>
                                        </td>
                                        <td className="p-4 w-[10%] text-slate-600">{c.GioiTinh}</td>
                                        <td className="p-4 w-[15%]">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full w-fit border ${c.MaHang === 'VIP' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    c.MaHang === 'Thân thiết' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                                }`}>
                                                <Crown size={12} /> {c.MaHang}
                                            </span>
                                        </td>
                                        <td className="p-4 w-[15%] text-right font-mono text-slate-700 font-bold">{c.DiemLoyalty.toLocaleString()}</td>
                                        <td className="p-4 w-[15%] text-right font-bold text-[#0056b3]">{c.ChiTieu}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Footer */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                    <div className="text-xs text-slate-500">
                        Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, allCustomers.length)}</strong> / <strong>{allCustomers.length}</strong>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50 text-xs"
                        >
                            Trước
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-6 h-6 flex items-center justify-center rounded text-xs font-medium ${p === currentPage
                                            ? 'bg-[#0056b3] text-white'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
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

            {/* Right: Analytics Panel (Fixed Width) */}
            <div className="w-[300px] shrink-0 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                    <h3 className="font-bold text-[#333333] flex items-center gap-2 text-sm">
                        <TrendingUp size={16} className="text-[#0056b3]" /> Phân tích (HANG_THANH_VIEN)
                    </h3>
                </div>

                <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-xs text-slate-500 mb-1 uppercase font-bold">Tỷ lệ giữ chân</div>
                        <div className="text-2xl font-bold text-[#0056b3]">85.4%</div>
                        <div className="w-full bg-white/60 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-[#0056b3] h-full w-[85%]"></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-bold text-xs text-slate-700 uppercase">Cơ cấu hạng</h4>
                        {[
                            { label: 'VIP', count: '5%', color: 'bg-yellow-400' },
                            { label: 'Thân thiết', count: '25%', color: 'bg-blue-400' },
                            { label: 'Thành viên', count: '70%', color: 'bg-slate-300' }
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="text-slate-600 font-medium">{item.label}</span>
                                    <span className="font-bold text-slate-800">{item.count}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className={`${item.color} h-full`} style={{ width: item.count }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
