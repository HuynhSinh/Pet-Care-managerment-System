import { Crown, TrendingUp, Search, User, ChevronLeft, ChevronRight, Filter, Download, Plus, Edit, Trash2, X, Save, PawPrint } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';

const API_URL = '/api';

export default function CustomerManagement() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 9;

    // Detail / Edit Modal
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // Form State (for Create/Edit)
    const [formData, setFormData] = useState({ tenkh: '', sdt: '', email: '', cccd: '', gioitinh: 'Nam', ngaysinh: '' });
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [stats, setStats] = useState<any[]>([]);
    const [statsLoading, setStatsLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/customers?page=${currentPage}&limit=${itemsPerPage}&search=${search}`);
            if (res.data.success) {
                setCustomers(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Error fetching customers", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/customers/stats`);
            if (res.data.success) {
                setStats(res.data.distribution);
            }
        } catch (error) {
            console.error("Error fetching stats", error);
        } finally {
            setStatsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        fetchStats();
    }, [currentPage, search]);

    const fetchDetail = async (id: number) => {
        setDetailLoading(true);
        try {
            const res = await axios.get(`${API_URL}/customers/${id}`);
            if (res.data.success) {
                setSelectedCustomer(res.data.data);
                setFormData({
                    tenkh: res.data.data.tenkh,
                    sdt: res.data.data.sdt,
                    email: res.data.data.email || '',
                    cccd: res.data.data.cccd || '',
                    gioitinh: res.data.data.gioitinh || 'Nam',
                    ngaysinh: res.data.data.ngaysinh ? res.data.data.ngaysinh.split('T')[0] : ''
                });
                setIsDetailOpen(true);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error fetching detail", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCreateWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/customers`, formData);
            setIsCreateOpen(false);
            setFormData({ tenkh: '', sdt: '', email: '', cccd: '', gioitinh: 'Nam', ngaysinh: '' });
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi tạo khách hàng");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;
        try {
            const res = await axios.put(`${API_URL}/customers/${selectedCustomer.makh}`, formData);
            alert("Cập nhật thành công!");
            setIsEditing(false);
            fetchDetail(selectedCustomer.makh); // Refresh detail
            fetchData(); // Refresh list
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi cập nhật");
        }
    };

    const handleDelete = async () => {
        if (!selectedCustomer || !confirm("Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.")) return;
        try {
            await axios.delete(`${API_URL}/customers/${selectedCustomer.makh}`);
            setIsDetailOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Không thể xóa khách hàng");
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // Stats Logic (Client-side approximation for demo)
    const totalCustomers = customers.length; // This is only current page, ideally aggregate from backend
    // Since we only have 'list' API, we might skip precise stats or rely on mock for the sidebar for now unless we add a stats endpoint.
    // Let's rely on the visual from the design.

    return (
        <div className="h-full flex gap-4 overflow-hidden pb-1">
            {/* Left: Customer List Main Area (Full Height, No Global Scroll) */}
            <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0 h-[80px]">
                    <div>
                        <h3 className="font-bold text-[#333333] text-lg">Khách Hàng (KHACH_HANG)</h3>
                        <p className="text-xs text-slate-500">Quản lý tài khoản & hạng thành viên</p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <Dialog.Trigger asChild>
                                <button onClick={() => setFormData({ tenkh: '', sdt: '', email: '', cccd: '', gioitinh: 'Nam', ngaysinh: '' })} className="bg-[#0056b3] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                                    <Plus size={16} /> Thêm KH
                                </button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                                <Dialog.Content className="fixed left-[50%] top-[50%] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-2xl focus:outline-none z-50">
                                    <Dialog.Title className="text-lg font-bold mb-4">Thêm Khách Hàng Mới</Dialog.Title>
                                    <form onSubmit={handleCreateWrapper} className="flex flex-col gap-3">
                                        <input required className="border p-2 rounded text-sm" placeholder="Họ tên" value={formData.tenkh} onChange={e => setFormData({ ...formData, tenkh: e.target.value })} />
                                        <input required className="border p-2 rounded text-sm" placeholder="Số điện thoại" value={formData.sdt} onChange={e => setFormData({ ...formData, sdt: e.target.value })} />
                                        <input className="border p-2 rounded text-sm" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                        <div className="flex gap-4">
                                            <select className="border p-2 rounded text-sm" value={formData.gioitinh} onChange={e => setFormData({ ...formData, gioitinh: e.target.value })}>
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                            </select>
                                            <div className="flex-1">
                                                <input type="date" className="border p-2 rounded text-sm w-full" value={formData.ngaysinh} onChange={e => setFormData({ ...formData, ngaysinh: e.target.value })} />
                                            </div>
                                            <input className="border p-2 rounded text-sm flex-1" placeholder="CCCD" value={formData.cccd} onChange={e => setFormData({ ...formData, cccd: e.target.value })} />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-3 py-2 bg-slate-100 rounded text-sm hover:bg-slate-200">Hủy</button>
                                            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Lưu</button>
                                        </div>
                                    </form>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>

                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-600">
                            <Download size={16} /> Export
                        </button>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4" />
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="pl-9 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500"
                                placeholder="Tìm tên, SĐT..."
                            />
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="bg-slate-100 border-b border-slate-200 shrink-0">
                        <table className="w-full text-left table-fixed">
                            <thead className="text-slate-500 text-xs font-bold uppercase">
                                <tr>
                                    <th className="p-4 w-[10%]">Mã KH</th>
                                    <th className="p-4 w-[20%]">Họ Tên</th>
                                    <th className="p-4 w-[15%]">SĐT / CCCD</th>
                                    <th className="p-4 w-[10%]">Giới Tính</th>
                                    <th className="p-4 w-[15%]">Hạng</th>
                                    <th className="p-4 w-[15%] text-right">Điểm Loyalty</th>
                                    <th className="p-4 w-[15%] text-right">Tổng Chi Tiêu</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (
                            <table className="w-full text-left table-fixed">
                                <tbody className="divide-y divide-slate-100">
                                    {customers.map(c => (
                                        <tr key={c.makh} onClick={() => fetchDetail(c.makh)} className="hover:bg-blue-50/30 cursor-pointer transition-colors text-sm group">
                                            <td className="p-4 w-[10%] font-mono text-slate-500">#{c.makh}</td>
                                            <td className="p-4 w-[20%] font-bold text-[#333333] group-hover:text-blue-600">{c.tenkh}</td>
                                            <td className="p-4 w-[15%]">
                                                <div className="text-slate-700">{c.sdt}</div>
                                                <div className="text-xs text-slate-400">{c.cccd}</div>
                                            </td>
                                            <td className="p-4 w-[10%] text-slate-600">{c.gioitinh}</td>
                                            <td className="p-4 w-[15%]">
                                                <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full w-fit border ${c.mahang === 'VIP' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    c.mahang === 'Thân thiết' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-slate-50 text-slate-600 border-slate-200'
                                                    }`}>
                                                    <Crown size={12} /> {c.mahang}
                                                </span>
                                            </td>
                                            <td className="p-4 w-[15%] text-right font-mono text-slate-700 font-bold">{c.diemloyalty}</td>
                                            <td className="p-4 w-[15%] text-right font-bold text-[#0056b3]">{formatCurrency(c.tongchitieu)}</td>
                                        </tr>
                                    ))}
                                    {customers.length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-8 text-slate-400">Không tìm thấy khách hàng.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                    <div className="text-xs text-slate-500">
                        Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)}</strong>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded hover:bg-white text-xs disabled:opacity-50">Trước</button>
                        {/* Simple pages for now */}
                        <span className="px-2 py-1 text-xs">{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded hover:bg-white text-xs disabled:opacity-50">Sau</button>
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
                        {statsLoading ? (
                            <div className="text-center py-4 text-xs text-slate-400">Đang tải thống kê...</div>
                        ) : stats.length > 0 ? (
                            stats.map((item: any, idx: number) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center text-xs mb-1">
                                        <span className="text-slate-600 font-medium">{item.label}</span>
                                        <span className="font-bold text-slate-800">{item.percentage}% ({item.count})</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.label === 'VIP' ? 'bg-yellow-400' :
                                            item.label === 'Thân thiết' ? 'bg-blue-400' : 'bg-slate-300'
                                            }`} style={{ width: `${item.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-xs text-slate-400">Chưa có dữ liệu phân hạng</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail / Edit Modal */}
            <Dialog.Root open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white shadow-2xl focus:outline-none z-50 overflow-hidden flex flex-col max-h-[90vh]">
                        {detailLoading ? (
                            <div className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : selectedCustomer && (
                            <>
                                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                            {selectedCustomer.tenkh.charAt(0)}
                                        </div>
                                        <div>
                                            {isEditing ? (
                                                <input className="font-bold text-xl text-slate-800 bg-white border rounded px-1 mb-1 w-full" value={formData.tenkh} onChange={e => setFormData({ ...formData, tenkh: e.target.value })} />
                                            ) : (
                                                <h2 className="font-bold text-xl text-slate-800">{selectedCustomer.tenkh}</h2>
                                            )}
                                            <div className="flex gap-2 text-sm text-slate-500">
                                                <span className="bg-slate-200 px-2 py-0.5 rounded text-xs text-slate-700 font-bold">Member</span>
                                                <span>ID: #{selectedCustomer.makh}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Dialog.Close asChild>
                                        <button className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
                                    </Dialog.Close>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    {isEditing ? (
                                        <form id="edit-form" onSubmit={handleUpdate} className="grid grid-cols-2 gap-4 mb-6">
                                            <div><label className="text-xs font-bold text-slate-500">SĐT</label><input className="w-full border p-2 rounded text-sm" value={formData.sdt} onChange={e => setFormData({ ...formData, sdt: e.target.value })} /></div>
                                            <div><label className="text-xs font-bold text-slate-500">Email</label><input className="w-full border p-2 rounded text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                            <div><label className="text-xs font-bold text-slate-500">CCCD</label><input className="w-full border p-2 rounded text-sm" value={formData.cccd} onChange={e => setFormData({ ...formData, cccd: e.target.value })} /></div>
                                            <div><label className="text-xs font-bold text-slate-500">Giới tính</label>
                                                <select className="w-full border p-2 rounded text-sm" value={formData.gioitinh} onChange={e => setFormData({ ...formData, gioitinh: e.target.value })}>
                                                    <option>Nam</option><option>Nữ</option>
                                                </select>
                                            </div>
                                            <div><label className="text-xs font-bold text-slate-500">Ngày sinh</label><input type="date" className="w-full border p-2 rounded text-sm" value={formData.ngaysinh} onChange={e => setFormData({ ...formData, ngaysinh: e.target.value })} /></div>
                                        </form>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                            <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại</div><div className="font-medium text-slate-800">{selectedCustomer.sdt}</div></div>
                                            <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Email</div><div className="font-medium text-slate-800">{selectedCustomer.email || 'Chưa cập nhật'}</div></div>
                                            <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">CCCD</div><div className="font-medium text-slate-800">{selectedCustomer.cccd || '---'}</div></div>
                                            <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Giới tính</div><div className="font-medium text-slate-800">{selectedCustomer.gioitinh}</div></div>
                                            <div><div className="text-xs font-bold text-slate-500 uppercase mb-1">Ngày sinh</div><div className="font-medium text-slate-800">{selectedCustomer.ngaysinh ? new Date(selectedCustomer.ngaysinh).toLocaleDateString('vi-VN') : '---'}</div></div>
                                            <div className="col-span-2 bg-blue-50 p-3 rounded-lg flex justify-between items-center border border-blue-100">
                                                <span className="text-blue-800 font-bold text-sm">Tổng Chi Tiêu Trọn Đời</span>
                                                <span className="text-xl font-bold text-[#0056b3]">{formatCurrency(selectedCustomer.tongchitieu)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><PawPrint size={18} className="text-orange-500" /> Thú Cưng ({selectedCustomer.pets?.length || 0})</h3>
                                    {selectedCustomer.pets && selectedCustomer.pets.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedCustomer.pets.map((p: any) => (
                                                <div key={p.matc} className="border border-slate-200 p-3 rounded-lg flex gap-3 items-center">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><PawPrint size={16} /></div>
                                                    <div>
                                                        <div className="font-bold text-slate-700">{p.tentc}</div>
                                                        <div className="text-xs text-slate-500">{p.loai} - {p.giong}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm italic">Khách hàng chưa đăng ký thú cưng nào.</p>
                                    )}
                                </div>

                                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
                                    {isEditing ? (
                                        <>
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded font-medium text-sm">Hủy Bỏ</button>
                                            <button form="edit-form" type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm flex items-center gap-2"><Save size={16} /> Lưu Thay Đổi</button>
                                        </>
                                    ) : (
                                        <>
                                            <button type="button" onClick={handleDelete} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium text-sm flex items-center gap-2"><Trash2 size={16} /> Xóa Khách Hàng</button>
                                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }} className="px-4 py-2 bg-[#0056b3] hover:bg-blue-700 text-white rounded font-bold text-sm flex items-center gap-2"><Edit size={16} /> Chỉnh Sửa</button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
