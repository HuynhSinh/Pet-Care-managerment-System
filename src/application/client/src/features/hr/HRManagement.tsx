import { useState, useEffect } from 'react';
import {
    Briefcase, MapPin, Search, Plus, Trash2, Edit, Download, Phone, User, Calendar, DollarSign, X
} from 'lucide-react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';

const API_URL = '/api';

export default function HRManagement() {
    // State
    const [employees, setEmployees] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [transferHistory, setTransferHistory] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        hoten: '',
        ngaysinh: '',
        gioitinh: 'Nam',
        sdt: '',
        chucvu: 'Nhân viên',
        luongcoban: '',
        ngayvaolam: new Date().toISOString().split('T')[0],
        macn: ''
    });

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, branchRes] = await Promise.all([
                axios.get(`${API_URL}/staff`),
                axios.get(`${API_URL}/dashboard/branches`)
            ]);

            if (staffRes.data.success) {
                setEmployees(staffRes.data.data);
            }
            if (branchRes.data.success) {
                setBranches(branchRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching HR data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (id: number) => {
        try {
            const res = await axios.get(`${API_URL}/staff/${id}/history`);
            if (res.data.success) {
                setTransferHistory(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching history", error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic
    const filteredData = employees.filter(emp =>
        emp.hoten.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.sdt && emp.sdt.includes(searchQuery)) ||
        (emp.manv && emp.manv.toString().includes(searchQuery))
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Handlers
    const handleOpenAdd = () => {
        setEditingId(null);
        setTransferHistory([]);
        setFormData({
            hoten: '',
            ngaysinh: '',
            gioitinh: 'Nam',
            sdt: '',
            chucvu: 'Nhân viên',
            luongcoban: '',
            ngayvaolam: new Date().toISOString().split('T')[0],
            macn: branches[0]?.macn || ''
        });
        setIsAddOpen(true);
    }

    const handleOpenEdit = (emp: any) => {
        setEditingId(emp.manv);
        setFormData({
            hoten: emp.hoten,
            ngaysinh: emp.ngaysinh ? emp.ngaysinh.split('T')[0] : '',
            gioitinh: emp.gioitinh || 'Nam',
            sdt: emp.sdt || '',
            chucvu: emp.chucvu || '',
            luongcoban: emp.luongcoban || '',
            ngayvaolam: emp.ngayvaolam ? emp.ngayvaolam.split('T')[0] : '',
            macn: emp.macn
        });
        fetchHistory(emp.manv);
        setIsAddOpen(true);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let res;
            if (editingId) {
                res = await axios.put(`${API_URL}/staff/${editingId}`, formData);
            } else {
                res = await axios.post(`${API_URL}/staff`, formData);
            }

            if (res.data.success) {
                setIsAddOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error("Failed to save employee", error);
            alert("Failed to save employee");
        }
    };

    const handleDelete = async () => {
        if (!editingId) return;
        if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này? Hành động không thể hoàn tác.")) return;

        try {
            const res = await axios.delete(`${API_URL}/staff/${editingId}`);
            if (res.data.success) {
                setIsAddOpen(false);
                fetchData();
            }
        } catch (error: any) {
            if (error.response?.status === 400) {
                alert(error.response.data.message);
            } else {
                console.error("Failed to delete", error);
                alert("Failed to delete employee");
            }
        }
    }

    const handleExportCSV = () => {
        const headers = ["ID", "Họ Tên", "Giới Tính", "Chức Vụ", "CN", "SĐT", "Ngày Vào", "Lương CB"];
        const rows = filteredData.map(e => [
            e.manv,
            `"${e.hoten}"`,
            e.gioitinh,
            e.chucvu,
            `"${e.tencn}"`,
            e.sdt,
            e.ngayvaolam?.split('T')[0],
            e.luongcoban
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "danh_sach_nhan_vien.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (val: string | number) => {
        if (!val) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    // Pagination Component
    const renderPagination = () => {
        const pages = [];
        // Simple logic for numbered pagination: show all if small, or simpler range
        // For now, showing all page numbers as typical management list isn't huge yet
        // If huge, we'd add ellipsis logic
        for (let i = 1; i <= totalPages; i++) {
            // Only show partial if too many pages? Lets keep simple: all pages for now as requested "1, 2, 3"
            if (totalPages > 10 && Math.abs(currentPage - i) > 2 && i !== 1 && i !== totalPages) {
                if (Math.abs(currentPage - i) === 3) pages.push(<span key={`ellipsis-${i}`} className="px-2">...</span>);
                continue;
            }

            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 text-xs font-medium border rounded transition ${currentPage === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="flex gap-1 items-center">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50 text-xs font-medium"
                >
                    Trước
                </button>
                {pages}
                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50 text-xs font-medium"
                >
                    Sau
                </button>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-[#333333]">Nhân Sự</h2>
                    <p className="text-xs text-slate-500">Quản lý hồ sơ & Lương cơ bản. Tổng: {filteredData.length} nhân viên</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-600 active:scale-95 transition">
                        <Download size={16} /> Export CSV
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm nhân viên..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0056b3] w-64 shadow-sm transition-all"
                        />
                    </div>

                    <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <Dialog.Trigger asChild>
                            <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-[#0056b3] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-500/20 active:scale-95">
                                <Plus size={16} /> Thêm Mới
                            </button>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                            <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[90vh] w-[95vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-2xl focus:outline-none z-50 overflow-y-auto">
                                <div className="flex justify-between items-center mb-5 border-b pb-3 border-slate-100">
                                    <Dialog.Title className="text-xl font-bold text-slate-800">{editingId ? 'Chi Tiết Nhân Viên' : 'Thêm Nhân Viên Mới'}</Dialog.Title>
                                    <Dialog.Close asChild>
                                        <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </Dialog.Close>
                                </div>

                                <div className="flex gap-6">
                                    {/* Left Column: Form */}
                                    <div className="flex-1">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <fieldset className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Họ và Tên <span className="text-red-500">*</span></label>
                                                    <input required className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                        value={formData.hoten} onChange={e => setFormData({ ...formData, hoten: e.target.value })} placeholder="Nguyễn Văn A" />
                                                </fieldset>
                                                <fieldset className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Chức vụ <span className="text-red-500">*</span></label>
                                                    <input required className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                        value={formData.chucvu} onChange={e => setFormData({ ...formData, chucvu: e.target.value })} placeholder="Bác sĩ, Tiếp tân..." />
                                                </fieldset>

                                                <fieldset className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Giới tính</label>
                                                    <select className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                        value={formData.gioitinh} onChange={e => setFormData({ ...formData, gioitinh: e.target.value })}>
                                                        <option value="Nam">Nam</option>
                                                        <option value="Nữ">Nữ</option>
                                                        <option value="Khác">Khác</option>
                                                    </select>
                                                </fieldset>
                                                <fieldset className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Ngày sinh</label>
                                                    <input type="date" className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                        value={formData.ngaysinh} onChange={e => setFormData({ ...formData, ngaysinh: e.target.value })} />
                                                </fieldset>

                                                <fieldset className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                                                    <input className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                        value={formData.sdt} onChange={e => setFormData({ ...formData, sdt: e.target.value })} placeholder="090..." />
                                                </fieldset>
                                                <fieldset className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Chi nhánh (Điều động) <span className="text-red-500">*</span></label>
                                                    <select required className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                        value={formData.macn} onChange={e => setFormData({ ...formData, macn: e.target.value })}>
                                                        <option value="" disabled>Chọn chi nhánh</option>
                                                        {branches.map(b => (
                                                            <option key={b.macn} value={b.macn}>{b.tencn}</option>
                                                        ))}
                                                    </select>
                                                </fieldset>

                                                <fieldset className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Ngày vào làm</label>
                                                    <input type="date" className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                        value={formData.ngayvaolam} onChange={e => setFormData({ ...formData, ngayvaolam: e.target.value })} />
                                                </fieldset>
                                                <fieldset className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Lương cơ bản (VNĐ)</label>
                                                    <input type="number" className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                        value={formData.luongcoban} onChange={e => setFormData({ ...formData, luongcoban: e.target.value })} placeholder="10000000" />
                                                </fieldset>
                                            </div>
                                            <div className="mt-8 flex justify-between gap-3 pt-4 border-t border-slate-100 items-center">
                                                <div>
                                                    {editingId && (
                                                        <button type="button" onClick={handleDelete} className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={16} /> Xóa Nhân Viên
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    <Dialog.Close asChild>
                                                        <button type="button" className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 text-slate-600 transition-colors">Hủy bỏ</button>
                                                    </Dialog.Close>
                                                    <button type="submit" className="px-4 py-2 bg-[#0056b3] text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">
                                                        {editingId ? 'Cập nhật' : 'Lưu Nhân Viên'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Right Column: Transfer History (Only in Edit Mode) */}
                                    {editingId && (
                                        <div className="w-[300px] border-l border-slate-100 pl-6 flex flex-col">
                                            <h3 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2"><MapPin size={16} /> Lịch Sử Điều Động</h3>
                                            <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                                                {transferHistory.length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic">Chưa có lịch sử điều động.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {transferHistory.map((h, idx) => (
                                                            <div key={idx} className="relative pl-4 border-l-2 border-slate-200 pb-1">
                                                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                                                <div className="text-xs font-semibold text-slate-600">{formatDate(h.ngaychuyen)}</div>
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    Từ: <span className="font-medium text-slate-700">{h.tencn_cu}</span>
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    Đến: <span className="font-medium text-[#0056b3]">{h.tencn_moi}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-blue-600 font-medium">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                )}

                {/* Fixed Header */}
                <div className="bg-slate-100 border-b border-slate-200 shrink-0">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-slate-600 font-bold text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 w-[10%]">Mã NV</th>
                                <th className="px-6 py-4 w-[25%]">Họ Tên & Giới tính</th>
                                <th className="px-6 py-4 w-[20%]">Chức vụ & CN</th>
                                <th className="px-6 py-4 w-[15%]">Thông tin liên lạc</th>
                                <th className="px-6 py-4 w-[15%]">Ngày vào làm</th>
                                <th className="px-6 py-4 w-[15%] text-right">Lương CB</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left table-fixed">
                        <tbody className="divide-y divide-slate-100">
                            {currentData.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        Không tìm thấy nhân viên nào
                                    </td>
                                </tr>
                            ) : currentData.map((emp) => (
                                <tr key={emp.manv} onClick={() => handleOpenEdit(emp)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                                    <td className="px-6 py-4 w-[10%] font-mono text-slate-500 text-sm">#{emp.manv}</td>
                                    <td className="px-6 py-4 w-[25%]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                                                {emp.hoten.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#333333] text-sm group-hover:text-blue-600 transition-colors">{emp.hoten}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <User size={10} /> {emp.gioitinh || 'N/A'} - {emp.ngaysinh ? formatDate(emp.ngaysinh) : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 w-[20%]">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                            <Briefcase size={14} className="text-[#0056b3]" /> {emp.chucvu}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <MapPin size={12} /> {emp.tencn || 'Chưa phân công'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 w-[15%]">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Phone size={14} className="text-slate-400" /> {emp.sdt || '---'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 w-[15%] text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            {formatDate(emp.ngayvaolam)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 w-[15%] text-right font-mono text-slate-700 font-medium text-sm">
                                        {formatCurrency(emp.luongcoban)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                <div className="text-xs text-slate-500 font-medium">Trang {currentPage} / {totalPages || 1}</div>
                {renderPagination()}
            </div>
        </div>
    );
}
