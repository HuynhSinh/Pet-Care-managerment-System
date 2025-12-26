import {
    Stethoscope, Syringe, Sparkles, AlertCircle, Plus, ChevronRight, Bookmark
} from 'lucide-react';
import { useState } from 'react';

// Mock based on GOI_TIEM and DICH_VU schemas
const allPackages = [
    { MaGoi: 1, TenGoi: 'Gói Tiêm Chó Con (7 Bệnh)', ThoiGian: '12 tháng', UuDai: '10%' },
    { MaGoi: 2, TenGoi: 'Gói Tiêm Mèo Con (4 Bệnh)', ThoiGian: '12 tháng', UuDai: '10%' },
    { MaGoi: 3, TenGoi: 'Gói Khám Sức Khỏe Toàn Diện', ThoiGian: '6 tháng', UuDai: '15%' },
];

const allServices = [
    { MaDV: 1, LoaiDV: 'Khám Lâm Sàng' },
    { MaDV: 2, LoaiDV: 'Tiêm Phòng (Lẻ)' },
    { MaDV: 3, LoaiDV: 'Spa & Grooming' },
    { MaDV: 4, LoaiDV: 'Phẫu Thuật' },
    { MaDV: 5, LoaiDV: 'Lưu Chuồng (Hotel)' },
];

export default function ServicesManagement() {
    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">

            {/* Left: Service Categories (DICH_VU) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-[#333333]">Danh mục Dịch vụ (DICH_VU)</h3>
                        <p className="text-xs text-slate-500">Phân loại các nhóm dịch vụ chính</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#0056b3] text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
                        <Plus size={16} /> Thêm Loại
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-3">
                        {allServices.map(svc => (
                            <div key={svc.MaDV} className="p-4 border border-slate-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition flex items-center justify-between group bg-white cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0056b3]">
                                        <Stethoscope size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{svc.LoaiDV}</div>
                                        <div className="text-xs text-slate-500 mt-1">Mã: DV{svc.MaDV}</div>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-[#0056b3]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Vaccine Packages (GOI_TIEM) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-emerald-50 shrink-0 flex justify-between items-center">
                    <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                        <Syringe size={18} /> Gói Tiêm & Ưu Đãi (GOI_TIEM)
                    </h3>
                    <button className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-700">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {allPackages.map(pkg => (
                            <div key={pkg.MaGoi} className="bg-white border border-emerald-100 p-4 rounded-lg shadow-sm flex flex-col gap-2 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                                    -{pkg.UuDai}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Bookmark className="text-emerald-600" size={20} />
                                    <span className="font-bold text-slate-800">{pkg.TenGoi}</span>
                                </div>
                                <div className="flex gap-4 text-xs text-slate-500 ml-8">
                                    <span>Hiệu lực: <b className="text-slate-700">{pkg.ThoiGian}</b></span>
                                    <span>Mã Gói: <b className="text-slate-700">GT{pkg.MaGoi}</b></span>
                                </div>
                                <button className="mt-2 ml-8 w-fit text-xs font-bold text-emerald-600 hover:underline">
                                    Xem chi tiết quyền lợi
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-2 text-orange-700 font-bold text-sm mb-2">
                            <AlertCircle size={16} /> Cảnh báo kho Vắc-xin
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                            <div className="flex justify-between">
                                <span>Rabies (Dại)</span>
                                <span className="font-bold text-red-500">Còn 5 liều</span>
                            </div>
                            <div className="w-full bg-orange-200 h-1 rounded-full">
                                <div className="bg-red-500 h-full w-[10%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
