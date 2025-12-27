import {
    Stethoscope, Syringe, Sparkles, AlertCircle, Plus, ChevronRight, Bookmark, MapPin, Trash2, Edit, Save, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';

const API_URL = '/api';

export default function ServicesManagement() {
    const [services, setServices] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search State
    const [svcSearch, setSvcSearch] = useState('');
    const [pkgSearch, setPkgSearch] = useState('');

    // Pagination State
    const [svcPage, setSvcPage] = useState(1);
    const [pkgPage, setPkgPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    const [selectedService, setSelectedService] = useState<any>(null);
    const [serviceBranches, setServiceBranches] = useState<any[]>([]);
    const [showBranchesModal, setShowBranchesModal] = useState(false);

    // Forms
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [serviceForm, setServiceForm] = useState({ loaidv: '' });

    const [isAddPkgOpen, setIsAddPkgOpen] = useState(false);
    const [editingPkgId, setEditingPkgId] = useState<number | null>(null);
    const [pkgForm, setPkgForm] = useState({ tengoi: '', thoigian: '', uudai: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [svcRes, pkgRes] = await Promise.all([
                axios.get(`${API_URL}/services`),
                axios.get(`${API_URL}/services/packages`)
            ]);
            if (svcRes.data.success) setServices(svcRes.data.data);
            if (pkgRes.data.success) setPackages(pkgRes.data.data);
        } catch (error) {
            console.error("Error fetching services data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic
    const filteredServices = services.filter(s => s.loaidv.toLowerCase().includes(svcSearch.toLowerCase()));
    const filteredPackages = packages.filter(p => p.tengoi.toLowerCase().includes(pkgSearch.toLowerCase()));

    // Pagination Logic
    const svcTotalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
    const pkgTotalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);

    const currentServices = filteredServices.slice((svcPage - 1) * ITEMS_PER_PAGE, svcPage * ITEMS_PER_PAGE);
    const currentPackages = filteredPackages.slice((pkgPage - 1) * ITEMS_PER_PAGE, pkgPage * ITEMS_PER_PAGE);

    const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
        if (totalPages <= 1) return null;

        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 5 && Math.abs(currentPage - i) > 1 && i !== 1 && i !== totalPages) {
                if (Math.abs(currentPage - i) === 2) pages.push(<span key={`ellipsis-${i}`} className="px-1 text-slate-400">..</span>);
                continue;
            }
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`min-w-[28px] h-7 text-xs font-medium border rounded transition flex items-center justify-center ${currentPage === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex gap-1 items-center justify-center mt-auto pt-4 border-t border-slate-100">
                <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 h-7 border border-slate-200 rounded hover:bg-white disabled:opacity-50 text-xs font-medium bg-slate-50 disabled:cursor-not-allowed"
                >
                    Trước
                </button>
                <div className="flex gap-1">{pages}</div>
                <button
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 h-7 border border-slate-200 rounded hover:bg-white disabled:opacity-50 text-xs font-medium bg-slate-50 disabled:cursor-not-allowed"
                >
                    Sau
                </button>
            </div>
        );
    };

    // Service handlers
    const fetchServiceBranches = async (svc: any) => {
        try {
            const res = await axios.get(`${API_URL}/services/${svc.madv}/branches`);
            setServiceBranches(res.data.data);
            setSelectedService(svc);
            setShowBranchesModal(true);
        } catch (error) {
            console.error("Error fetching branches", error);
        }
    };

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingServiceId) {
                await axios.put(`${API_URL}/services/${editingServiceId}`, serviceForm);
            } else {
                await axios.post(`${API_URL}/services`, serviceForm);
            }
            setIsAddServiceOpen(false);
            setEditingServiceId(null);
            setServiceForm({ loaidv: '' });
            fetchData();
        } catch (error) {
            console.error("Failed to save service", error);
            alert("Lỗi khi lưu dịch vụ");
        }
    };

    const handleDeleteService = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;
        try {
            await axios.delete(`${API_URL}/services/${id}`);
            fetchData();
            // Reset page if empty
            if (filteredServices.length === 1 && svcPage > 1) setSvcPage(svcPage - 1);
        } catch (error: any) {
            console.error("Failed to delete", error);
            alert(error.response?.data?.message || "Không thể xóa dịch vụ này.");
        }
    };

    const openEditService = (svc: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingServiceId(svc.madv);
        setServiceForm({ loaidv: svc.loaidv });
        setIsAddServiceOpen(true);
    };

    // Package handlers
    const handleSavePackage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPkgId) {
                await axios.put(`${API_URL}/services/packages/${editingPkgId}`, pkgForm);
            } else {
                await axios.post(`${API_URL}/services/packages`, pkgForm);
            }
            setIsAddPkgOpen(false);
            setEditingPkgId(null);
            setPkgForm({ tengoi: '', thoigian: '', uudai: '' });
            fetchData();
        } catch (error) {
            console.error("Failed save package", error);
            alert("Lỗi khi lưu gói.");
        }
    };

    const handleDeletePackage = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc chắn muốn xóa gói này?")) return;
        try {
            await axios.delete(`${API_URL}/services/packages/${id}`);
            fetchData();
            if (currentPackages.length === 1 && pkgPage > 1) setPkgPage(pkgPage - 1);
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi xóa gói.");
        }
    }

    const openEditPackage = (pkg: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPkgId(pkg.magoi);
        setPkgForm({ tengoi: pkg.tengoi, thoigian: pkg.thoigian, uudai: pkg.uudai });
        setIsAddPkgOpen(true);
    };

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden pb-1">

            {/* Left: Service Categories */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 flex flex-col gap-3 h-[124px] justify-between">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-[#333333]">Danh mục Dịch vụ</h3>
                            <p className="text-xs text-slate-500">Quản lý và tra cứu chi nhánh cung cấp</p>
                        </div>
                        <Dialog.Root open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                            <Dialog.Trigger asChild>
                                <button onClick={() => { setEditingServiceId(null); setServiceForm({ loaidv: '' }); }} className="flex items-center gap-2 bg-[#0056b3] text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 active:scale-95 transition">
                                    <Plus size={16} /> Thêm Loại
                                </button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                                <Dialog.Content className="fixed left-[50%] top-[50%] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-2xl focus:outline-none z-50">
                                    <Dialog.Title className="text-lg font-bold mb-4">{editingServiceId ? 'Sửa Tên Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</Dialog.Title>
                                    <form onSubmit={handleSaveService} className="flex flex-col gap-4">
                                        <fieldset className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-slate-700">Tên loại dịch vụ</label>
                                            <input required className="border border-slate-300 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                                                value={serviceForm.loaidv} onChange={e => setServiceForm({ ...serviceForm, loaidv: e.target.value })} placeholder="Ví dụ: Siêu âm màu" />
                                        </fieldset>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Dialog.Close asChild>
                                                <button type="button" className="px-3 py-2 bg-slate-100 rounded text-sm hover:bg-slate-200 text-slate-600">Hủy</button>
                                            </Dialog.Close>
                                            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium">Lưu</button>
                                        </div>
                                    </form>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </div>
                    {/* Search Bar Service */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            value={svcSearch}
                            onChange={(e) => { setSvcSearch(e.target.value); setSvcPage(1); }}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                        />
                        <div className="absolute left-2.5 top-1.5 text-slate-400 pointer-events-none">
                            <Edit size={12} className="opacity-0" /> {/* Placeholder icon size trick or use Search icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute top-0"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {currentServices.map(svc => (
                                    <div key={svc.madv}
                                        onClick={() => fetchServiceBranches(svc)}
                                        className="p-3 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm transition flex items-center justify-between group bg-white cursor-pointer relative"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#0056b3] shrink-0">
                                                <Stethoscope size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{svc.loaidv}</div>
                                                <div className="text-xs text-slate-500">DV{svc.madv}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity mr-2">
                                                <button onClick={(e) => openEditService(svc, e)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={(e) => handleDeleteService(svc.madv, e)} className="p-1.5 hover:bg-red-100 text-red-600 rounded">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-[#0056b3]" />
                                        </div>
                                    </div>
                                ))}
                                {filteredServices.length === 0 && <p className="text-center text-slate-400 text-sm py-8">Không tìm thấy dịch vụ.</p>}
                            </div>
                        )}
                    </div>
                    {/* Pagination */}
                    {renderPagination(svcPage, svcTotalPages, setSvcPage)}
                </div>
            </div>

            {/* Right: Vaccine Packages */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-emerald-50 shrink-0 flex flex-col gap-3 h-[124px] justify-between">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                            <Syringe size={18} /> Gói Tiêm & Ưu Đãi
                        </h3>
                        <Dialog.Root open={isAddPkgOpen} onOpenChange={setIsAddPkgOpen}>
                            <Dialog.Trigger asChild>
                                <button onClick={() => { setEditingPkgId(null); setPkgForm({ tengoi: '', thoigian: '', uudai: '' }); }} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-700 flex items-center gap-1 shadow-sm active:scale-95 transition">
                                    <Plus size={16} /> Thêm Gói
                                </button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                                <Dialog.Content className="fixed left-[50%] top-[50%] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-2xl focus:outline-none z-50">
                                    <Dialog.Title className="text-lg font-bold mb-4 text-emerald-800">{editingPkgId ? 'Cập Nhật Gói' : 'Thêm Gói Vắc-xin / Ưu Đãi'}</Dialog.Title>
                                    <form onSubmit={handleSavePackage} className="flex flex-col gap-4">
                                        <fieldset className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-slate-700">Tên Gói</label>
                                            <input required className="border border-slate-300 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none"
                                                value={pkgForm.tengoi} onChange={e => setPkgForm({ ...pkgForm, tengoi: e.target.value })} placeholder="Gói Tiêm Chó Con..." />
                                        </fieldset>
                                        <div className="grid grid-cols-2 gap-4">
                                            <fieldset className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700">Thời gian (tháng)</label>
                                                <input type="number" className="border border-slate-300 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none"
                                                    value={pkgForm.thoigian} onChange={e => setPkgForm({ ...pkgForm, thoigian: e.target.value })} placeholder="12" />
                                            </fieldset>
                                            <fieldset className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700">Ưu đãi (%)</label>
                                                <input type="number" className="border border-slate-300 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none"
                                                    value={pkgForm.uudai} onChange={e => setPkgForm({ ...pkgForm, uudai: e.target.value })} placeholder="10" />
                                            </fieldset>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Dialog.Close asChild>
                                                <button type="button" className="px-3 py-2 bg-slate-100 rounded text-sm hover:bg-slate-200 text-slate-600">Hủy</button>
                                            </Dialog.Close>
                                            <button type="submit" className="px-3 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 font-medium">Lưu</button>
                                        </div>
                                    </form>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </div>
                    {/* Search Bar Packages */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm gói..."
                            value={pkgSearch}
                            onChange={(e) => { setPkgSearch(e.target.value); setPkgPage(1); }}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-emerald-200 rounded focus:border-emerald-500 focus:outline-none"
                        />
                        <div className="absolute left-2.5 top-1.5 text-emerald-400 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute top-0"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                    </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {currentPackages.map(pkg => (
                                <div key={pkg.magoi} className="bg-white border border-emerald-100 p-3 rounded-lg shadow-sm flex flex-col gap-1 relative overflow-hidden group hover:border-emerald-300 transition-all cursor-default">
                                    {pkg.uudai > 0 && (
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                                            -{pkg.uudai}%
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Bookmark className="text-emerald-600" size={20} />
                                            <span className="font-bold text-slate-800 text-sm">{pkg.tengoi}</span>
                                        </div>
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-12">
                                            <button onClick={(e) => openEditPackage(pkg, e)} className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded">
                                                <Edit size={14} />
                                            </button>
                                            <button onClick={(e) => handleDeletePackage(pkg.magoi, e)} className="p-1.5 hover:bg-red-100 text-red-600 rounded">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-xs text-slate-500 ml-8">
                                        <span>Hiệu lực: <b className="text-slate-700">{pkg.thoigian} tháng</b></span>
                                        <span>Mã: <b className="text-slate-700">GT{pkg.magoi}</b></span>
                                    </div>
                                </div>
                            ))}
                            {filteredPackages.length === 0 && <p className="text-center text-slate-400 text-sm">Không tìm thấy gói.</p>}

                            <div className="mt-auto pt-4">
                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <div className="flex items-center gap-2 text-orange-700 font-bold text-xs mb-1">
                                        <AlertCircle size={14} /> Cảnh báo kho Vắc-xin
                                    </div>
                                    <div className="text-[10px] text-slate-600 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Rabies (Dại) (Demo)</span>
                                            <span className="font-bold text-red-500">Còn 5 liều</span>
                                        </div>
                                        <div className="w-full bg-orange-200 h-1 rounded-full">
                                            <div className="bg-red-500 h-full w-[10%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Pagination */}
                    {renderPagination(pkgPage, pkgTotalPages, setPkgPage)}
                </div>
            </div>

            {/* Branches Modal */}
            <Dialog.Root open={showBranchesModal} onOpenChange={setShowBranchesModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 animate-fade-in" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] max-w-lg w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white shadow-2xl focus:outline-none z-50 overflow-hidden animate-scale-in">
                        <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Chi nhánh cung cấp</h3>
                                <p className="text-sm text-[#0056b3] font-medium">{selectedService?.loaidv}</p>
                            </div>
                            <Dialog.Close asChild>
                                <button className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition"><X size={20} /></button>
                            </Dialog.Close>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {serviceBranches.length > 0 ? (
                                <ul className="space-y-3">
                                    {serviceBranches.map((br, idx) => (
                                        <li key={idx} className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg bg-white hover:border-blue-100 transition">
                                            <MapPin className="text-red-500 mt-0.5 shrink-0" size={18} />
                                            <div>
                                                <div className="font-bold text-slate-700 text-sm">{br.tencn}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{br.diachi || 'Chưa cập nhật địa chỉ'}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>Chưa có chi nhánh nào cung cấp dịch vụ này.</p>
                                </div>
                            )}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
