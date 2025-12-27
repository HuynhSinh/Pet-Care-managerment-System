import { Search, FileText, User, Plus, HeartPulse, Edit, Trash2, X, Save, PawPrint, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';

const API_URL = '/api';

export default function PetRecords() {
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 8;

    // Create / Edit Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // If true, modal is in Edit mode for `selectedPet`
    const [selectedPet, setSelectedPet] = useState<any>(null); // For Detail/Edit/Health
    const [formData, setFormData] = useState({ tentc: '', loai: 'Chó', giong: '', ngaysinh: '', gioitinh: 'Đực', tinhtrangsuckhoe: 'Bình thường', makh: '' });

    // Health History Modal
    const [isHealthOpen, setIsHealthOpen] = useState(false);
    const [healthHistory, setHealthHistory] = useState<any[]>([]);
    const [healthLoading, setHealthLoading] = useState(false);

    const fetchPets = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/pets?page=${currentPage}&limit=${itemsPerPage}&search=${search}`);
            if (res.data.success) {
                setPets(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, [currentPage, search]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/pets`, formData);
            alert("Thêm thú cưng thành công!");
            setIsCreateOpen(false);
            setFormData({ tentc: '', loai: 'Chó', giong: '', ngaysinh: '', gioitinh: 'Đực', tinhtrangsuckhoe: 'Bình thường', makh: '' });
            fetchPets();
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi thêm thú cưng");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPet) return;
        try {
            await axios.put(`${API_URL}/pets/${selectedPet.matc}`, formData);
            alert("Cập nhật thành công!");
            setIsCreateOpen(false);
            fetchPets();
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi cập nhật");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thú cưng này?")) return;
        try {
            await axios.delete(`${API_URL}/pets/${id}`);
            fetchPets();
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi xóa");
        }
    };

    const openEdit = (pet: any) => {
        setSelectedPet(pet);
        setFormData({
            tentc: pet.tentc,
            loai: pet.loai,
            giong: pet.giong,
            ngaysinh: pet.ngaysinh ? pet.ngaysinh.split('T')[0] : '',
            gioitinh: pet.gioitinh,
            tinhtrangsuckhoe: pet.tinhtrangsuckhoe || '',
            makh: pet.makh
        });
        setIsEditing(true);
        setIsCreateOpen(true);
    };

    const openCreate = () => {
        setSelectedPet(null);
        setFormData({ tentc: '', loai: 'Chó', giong: '', ngaysinh: '', gioitinh: 'Đực', tinhtrangsuckhoe: 'Bình thường', makh: '' });
        setIsEditing(false);
        setIsCreateOpen(true);
    };

    const openHealthHistory = async (pet: any) => {
        setSelectedPet(pet);
        setIsHealthOpen(true);
        setHealthLoading(true);
        try {
            const res = await axios.get(`${API_URL}/pets/${pet.matc}/health-history`);
            if (res.data.success) {
                setHealthHistory(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setHealthLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0 h-[80px]">
                <div>
                    <h3 className="font-bold text-[#333333] text-lg">Hồ sơ Thú Cưng (THU_CUNG)</h3>
                    <p className="text-xs text-slate-500">Quản lý hồ sơ & sức khỏe</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-9 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500"
                            placeholder="Tìm tên thú cưng..."
                        />
                    </div>

                    <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <Dialog.Trigger asChild>
                            <button onClick={openCreate} className="bg-[#0056b3] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                                <Plus size={16} /> Tiếp nhận
                            </button>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                            <Dialog.Content className="fixed left-[50%] top-[50%] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-2xl focus:outline-none z-50">
                                <Dialog.Title className="text-lg font-bold mb-4">{isEditing ? 'Cập Nhật Thú Cưng' : 'Tiếp Nhận Thú Cưng Mới'}</Dialog.Title>
                                <form onSubmit={isEditing ? handleUpdate : handleCreate} className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-500">Tên Thú Cưng</label>
                                        <input required className="w-full border p-2 rounded text-sm mt-1" value={formData.tentc} onChange={e => setFormData({ ...formData, tentc: e.target.value })} placeholder="VD: Milo, Lu..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Mã Chủ Sở Hữu (ID)</label>
                                        <input required type="number" className="w-full border p-2 rounded text-sm mt-1" value={formData.makh} onChange={e => setFormData({ ...formData, makh: e.target.value })} placeholder="ID Khách Hàng" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Loài</label>
                                        <select className="w-full border p-2 rounded text-sm mt-1" value={formData.loai} onChange={e => setFormData({ ...formData, loai: e.target.value })}>
                                            <option>Chó</option>
                                            <option>Mèo</option>
                                            <option>Khác</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Giống</label>
                                        <input className="w-full border p-2 rounded text-sm mt-1" value={formData.giong} onChange={e => setFormData({ ...formData, giong: e.target.value })} placeholder="VD: Poodle" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Giới Tính</label>
                                        <select className="w-full border p-2 rounded text-sm mt-1" value={formData.gioitinh} onChange={e => setFormData({ ...formData, gioitinh: e.target.value })}>
                                            <option>Đực</option>
                                            <option>Cái</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Ngày Sinh</label>
                                        <input type="date" className="w-full border p-2 rounded text-sm mt-1" value={formData.ngaysinh} onChange={e => setFormData({ ...formData, ngaysinh: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Tình Trạng Sức Khỏe</label>
                                        <input className="w-full border p-2 rounded text-sm mt-1" value={formData.tinhtrangsuckhoe} onChange={e => setFormData({ ...formData, tinhtrangsuckhoe: e.target.value })} placeholder="VD: Bình thường" />
                                    </div>

                                    <div className="col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t">
                                        <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-slate-100 rounded text-sm font-medium hover:bg-slate-200">Hủy</button>
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                                            <Save size={16} /> Lưu Hồ Sơ
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </div>
            </div>

            {/* Grid List for Pets */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {pets.map(pet => (
                            <div key={pet.matc} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition bg-white flex flex-col gap-3 group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-1 px-2 text-[10px] font-bold rounded-bl-lg ${pet.tinhtrangsuckhoe !== 'Bình thường' && pet.tinhtrangsuckhoe ? 'bg-red-500 text-white' : 'bg-green-100 text-green-700'}`}>
                                    {pet.tinhtrangsuckhoe || 'Tốt'}
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-6">
                                    <button onClick={() => openEdit(pet)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(pet.matc)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={14} /></button>
                                </div>

                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mt-2">
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-3xl cursor-default">
                                        {pet.loai === 'Mèo' ? '🐱' : '🐶'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-[#333333]">{pet.tentc}</div>
                                        <div className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit border border-slate-200 mt-1">
                                            {pet.giong} • {pet.gioitinh}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 mb-2">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-slate-400" />
                                        <span className="text-xs">Chủ: <b className="text-slate-700">{pet.tenkh || `#${pet.makh}`}</b></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HeartPulse size={14} className="text-slate-400" />
                                        <span className="text-xs">Sinh: {pet.ngaysinh ? new Date(pet.ngaysinh).toLocaleDateString('vi-VN') : '---'}</span>
                                    </div>
                                </div>

                                <button onClick={() => openHealthHistory(pet)} className="mt-auto w-full py-2 bg-slate-50 text-[#0056b3] font-bold text-xs rounded border border-slate-200 hover:bg-[#0056b3] hover:text-white hover:border-transparent transition-all flex justify-center items-center gap-2">
                                    <FileText size={14} /> Hồ Sơ Sức Khỏe
                                </button>
                            </div>
                        ))}
                        {pets.length === 0 && <div className="col-span-4 text-center text-slate-400 italic py-10">Không tìm thấy thú cưng nào.</div>}
                    </div>
                )}
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
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
                    >
                        Sau
                    </button>
                </div>
            </div>

            {/* Health History Modal */}
            <Dialog.Root open={isHealthOpen} onOpenChange={setIsHealthOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white shadow-2xl focus:outline-none z-50 flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <Dialog.Title className="text-lg font-bold flex items-center gap-2">
                                <History className="text-blue-600" size={20} /> Lịch Sử Sức Khỏe - {selectedPet?.tentc}
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
                            </Dialog.Close>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            {healthLoading ? (
                                <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                            ) : healthHistory.length > 0 ? (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {healthHistory.map((item, idx) => (
                                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors z-10">
                                                {item.type === 'Khám bệnh' ? <HeartPulse size={18} /> : <div className="font-bold text-xs">Vx</div>}
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-slate-800 text-sm">{item.type}</div>
                                                    <time className="font-caveat font-medium text-blue-600 text-xs">{new Date(item.date).toLocaleDateString('vi-VN')}</time>
                                                </div>
                                                <div className="text-slate-600 text-sm mb-2">{item.details}</div>
                                                <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                    <User size={10} /> Được thực hiện bởi: {item.performer || 'Unknown'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 italic py-10">Chưa có lịch sử khám bệnh hay tiêm phòng.</div>
                            )}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
