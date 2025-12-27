import { Package, Smartphone, AlertTriangle, Plus, Search, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';

const API_URL = '/api';

export default function ProductsInventory() {
    const [products, setProducts] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalProducts: 0, totalInventory: 0, lowStock: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 8; // Adjust to fit screen height better

    // Form
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ tensp: '', loaisp: '', giaban: '', soluongtonkho: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/products?page=${currentPage}&limit=${itemsPerPage}&search=${search}`),
                axios.get(`${API_URL}/products/stats`)
            ]);

            if (prodRes.data.success) {
                setProducts(prodRes.data.data);
                setTotalPages(prodRes.data.pagination.totalPages);
            }
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, search]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                giaban: parseFloat(formData.giaban),
                soluongtonkho: parseInt(formData.soluongtonkho)
            };

            if (editingId) {
                await axios.put(`${API_URL}/products/${editingId}`, payload);
            } else {
                await axios.post(`${API_URL}/products`, payload);
            }
            setIsFormOpen(false);
            setEditingId(null);
            setFormData({ tensp: '', loaisp: '', giaban: '', soluongtonkho: '' });
            fetchData();
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Lỗi khi lưu sản phẩm");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        try {
            await axios.delete(`${API_URL}/products/${id}`);
            fetchData();
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Lỗi khi xóa sản phẩm");
        }
    };

    const openEdit = (prod: any) => {
        setEditingId(prod.masp);
        setFormData({
            tensp: prod.tensp,
            loaisp: prod.loaisp || '',
            giaban: prod.giaban,
            soluongtonkho: prod.soluongtonkho
        });
        setIsFormOpen(true);
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val));
    };

    // Render Pagination Controls similar to Service page
    const renderPagination = () => {
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
                    onClick={() => setCurrentPage(i)}
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
            <div className="flex gap-1 items-center justify-center mt-auto pt-3 border-t border-slate-100">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 h-7 border border-slate-200 rounded hover:bg-white disabled:opacity-50 text-xs font-medium bg-slate-50 disabled:cursor-not-allowed"
                >
                    Trước
                </button>
                <div className="flex gap-1">{pages}</div>
                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 h-7 border border-slate-200 rounded hover:bg-white disabled:opacity-50 text-xs font-medium bg-slate-50 disabled:cursor-not-allowed"
                >
                    Sau
                </button>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden pb-1">

            {/* Top: Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-[#0056b3] rounded"><Smartphone size={24} /></div>
                    <div>
                        <div className="text-lg font-bold text-[#333333]">{stats.totalProducts}</div>
                        <div className="text-xs text-slate-500">Tổng Sản Phẩm (Mã)</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded"><Package size={24} /></div>
                    <div>
                        <div className="text-lg font-bold text-[#333333]">{stats.totalInventory}</div>
                        <div className="text-xs text-slate-500">Tổng Tồn Kho (Unit)</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className={`p-3 rounded ${stats.lowStock > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <div className={`text-lg font-bold ${stats.lowStock > 0 ? 'text-red-600' : 'text-[#333333]'}`}>{stats.lowStock}</div>
                        <div className="text-xs text-slate-500">Cảnh báo Tồn thấp {'(<10)'}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0 h-[80px]">
                    <div>
                        <h3 className="font-bold text-[#333333]">Kho Hàng & Sản Phẩm</h3>
                        <p className="text-xs text-slate-500">Quản lý nhập xuất và giá bán lẻ</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2 text-slate-400 w-4 h-4" />
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="pl-9 py-1.5 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500 bg-white"
                                placeholder="Tìm theo tên sản phẩm..."
                            />
                        </div>
                        <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <Dialog.Trigger asChild>
                                <button onClick={() => { setEditingId(null); setFormData({ tensp: '', loaisp: '', giaban: '', soluongtonkho: '' }); }} className="bg-[#0056b3] text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium shadow-sm">
                                    <Plus size={16} /> Nhập SP Mới
                                </button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                                <Dialog.Content className="fixed left-[50%] top-[50%] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-2xl focus:outline-none z-50">
                                    <Dialog.Title className="text-lg font-bold mb-4">{editingId ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</Dialog.Title>
                                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                                        <fieldset className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Tên Sản Phẩm <span className="text-red-500">*</span></label>
                                            <input required className="border border-slate-300 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                                                value={formData.tensp} onChange={e => setFormData({ ...formData, tensp: e.target.value })} placeholder="VD: Thức ăn Royal Canin..." />
                                        </fieldset>
                                        <div className="grid grid-cols-2 gap-4">
                                            <fieldset className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-slate-700">Loại SP</label>
                                                <select className="border border-slate-300 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                                                    value={formData.loaisp} onChange={e => setFormData({ ...formData, loaisp: e.target.value })}>
                                                    <option value="">-- Chọn Loại --</option>
                                                    <option value="Thức ăn">Thức ăn</option>
                                                    <option value="Thuốc">Thuốc</option>
                                                    <option value="Phụ kiện">Phụ kiện</option>
                                                    <option value="Đồ chơi">Đồ chơi</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            </fieldset>
                                            <fieldset className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-slate-700">Giá Bán (VNĐ) <span className="text-red-500">*</span></label>
                                                <input type="number" required className="border border-slate-300 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                                                    value={formData.giaban} onChange={e => setFormData({ ...formData, giaban: e.target.value })} placeholder="0" />
                                            </fieldset>
                                        </div>
                                        <fieldset className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Số Lượng Tồn Kho</label>
                                            <input type="number" className="border border-slate-300 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                                                value={formData.soluongtonkho} onChange={e => setFormData({ ...formData, soluongtonkho: e.target.value })} placeholder="0" />
                                        </fieldset>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Dialog.Close asChild>
                                                <button type="button" className="px-3 py-2 bg-slate-100 rounded text-sm hover:bg-slate-200 text-slate-600">Hủy</button>
                                            </Dialog.Close>
                                            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium flex items-center gap-2">
                                                <Save size={16} /> Lưu Sản Phẩm
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </div>
                </div>

                {/* Table Header Fixed */}
                <div className="border-b border-slate-200 bg-slate-50/50 shrink-0">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-slate-500 font-semibold text-xs uppercase">
                            <tr>
                                <th className="p-4 w-[10%] pl-6">Mã SP</th>
                                <th className="p-4 w-[35%]">Tên Sản Phẩm</th>
                                <th className="p-4 w-[15%]">Phân Loại</th>
                                <th className="p-4 w-[15%] text-right font-bold">Giá Bán</th>
                                <th className="p-4 w-[15%] text-center">Tồn Kho</th>
                                <th className="p-4 w-[10%] text-center">Thao Tác</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                {/* Table Body Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                        <table className="w-full text-left table-fixed border-collapse">
                            <tbody className="divide-y divide-slate-100">
                                {products.length > 0 ? (
                                    products.map(prod => (
                                        <tr key={prod.masp} className="hover:bg-slate-50 group transition-colors">
                                            <td className="p-3 w-[10%] pl-6 font-mono text-slate-500 text-xs">SP{prod.masp}</td>
                                            <td className="p-3 w-[35%] font-medium text-slate-800 text-sm">{prod.tensp}</td>
                                            <td className="p-3 w-[15%]">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${prod.loaisp === 'Thuốc' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                    prod.loaisp === 'Thức ăn' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {prod.loaisp || 'Khác'}
                                                </span>
                                            </td>
                                            <td className="p-3 w-[15%] text-right font-bold text-[#0056b3] text-sm tabular-nums tracking-wide">{formatCurrency(prod.giaban)}</td>
                                            <td className="p-3 w-[15%] text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${prod.soluongtonkho < 10
                                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                                    : 'text-slate-700'
                                                    }`}>
                                                    {prod.soluongtonkho < 10 && <AlertCircle size={10} />}
                                                    {prod.soluongtonkho}
                                                </div>
                                            </td>
                                            <td className="p-3 w-[10%] text-center">
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(prod)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition"><Edit size={14} /></button>
                                                    <button onClick={() => handleDelete(prod.masp)} className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Không tìm thấy sản phẩm nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination (Fixed at bottom of container) */}
                <div className="p-2 bg-white">
                    {renderPagination()}
                </div>
            </div>
        </div>
    );
}
