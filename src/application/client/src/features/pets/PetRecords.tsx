import { Search, FileText, User, Plus, HeartPulse } from 'lucide-react';
import { useState } from 'react';

// Mock Data based on THU_CUNG schema
// Columns: MaTC, TenTC, Loai, Giong, NgaySinh, GioiTinh, TinhTrangSucKhoe, MaKH
const generatePets = () => {
    return Array.from({ length: 40 }, (_, i) => ({
        MaTC: i + 1,
        TenTC: `Pet ${i + 1}`,
        Loai: i % 3 === 0 ? 'Mèo' : 'Chó',
        Giong: i % 3 === 0 ? 'Anh Lông Ngắn' : i % 2 === 0 ? 'Poodle' : 'Corgi',
        NgaySinh: '2022-05-10',
        GioiTinh: i % 2 === 0 ? 'Đực' : 'Cái',
        TinhTrangSucKhoe: i % 10 === 0 ? 'Đang điều trị' : 'Bình thường',
        MaKH: `KH${i + 1} (Nguyễn Văn A)`
    }));
};
const allPets = generatePets();

export default function PetRecords() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Grid layout 4x2 or similar
    const totalPages = Math.ceil(allPets.length / itemsPerPage);
    const currentData = allPets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="h-full flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                    <h3 className="font-bold text-[#333333]">Hồ sơ Thú Cưng (THU_CUNG)</h3>
                    <p className="text-xs text-slate-500">Quản lý {allPets.length} hồ sơ</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-2 top-2 text-slate-400 w-4 h-4" />
                        <input className="pl-8 py-2 border border-slate-200 rounded text-sm w-64 focus:outline-none focus:border-blue-500" placeholder="Tìm tên thú cưng..." />
                    </div>
                    <button className="flex items-center gap-2 bg-[#0056b3] text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 shadow-sm">
                        <Plus size={16} /> Tiếp nhận
                    </button>
                </div>
            </div>

            {/* Grid List - Full viewport height with internal scroll */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentData.map(pet => (
                        <div key={pet.MaTC} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition bg-white flex flex-col gap-3 group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 p-1 px-2 text-[10px] font-bold rounded-bl-lg ${pet.TinhTrangSucKhoe !== 'Bình thường' ? 'bg-red-500 text-white' : 'bg-green-100 text-green-700'}`}>
                                {pet.TinhTrangSucKhoe}
                            </div>

                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mt-2">
                                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform cursor-default">
                                    {pet.Loai === 'Mèo' ? '🐱' : '🐶'}
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-[#333333]">{pet.TenTC}</div>
                                    <div className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit border border-slate-200 mt-1">
                                        {pet.Giong} • {pet.GioiTinh}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 mb-2">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-slate-400" />
                                    <span className="text-xs">Chủ: <b className="text-slate-700">{pet.MaKH}</b></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <HeartPulse size={14} className="text-slate-400" />
                                    <span className="text-xs">Sinh: {pet.NgaySinh}</span>
                                </div>
                            </div>

                            <button className="mt-auto w-full py-2 bg-slate-50 text-[#0056b3] font-bold text-xs rounded border border-slate-200 hover:bg-[#0056b3] hover:text-white hover:border-transparent transition-all flex justify-center items-center gap-2">
                                <FileText size={14} /> Hồ Sơ Sức Khỏe
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
                <div className="text-xs text-slate-500">Trang {currentPage} / {totalPages}</div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
                    >
                        Trước
                    </button>
                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                className={`w-6 h-6 flex items-center justify-center rounded text-xs font-medium ${currentPage === p ? 'bg-[#0056b3] text-white' : 'hover:bg-slate-100'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
}
