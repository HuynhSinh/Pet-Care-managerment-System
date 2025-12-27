import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Briefcase, Activity, Plus, Edit, Trash2, MapPin, Phone, X, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';

// Helper to format currency
const formatCurrency = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return '0 đ';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' Tỷ';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + ' Tr';
    return num.toLocaleString('vi-VN') + ' đ';
};

// API Base URL
const API_URL = '/api/dashboard';

export default function Dashboard() {
    // State
    const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
    const [stats, setStats] = useState<any>({
        revenue: { value: 0, change: 0 },
        customers: { value: 0, change: 0 },
        invoices: { value: 0, change: 0 },
        exams: { value: 0, change: 0 }
    });
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [sourceData, setSourceData] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

    // Modal State
    const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
    const [newBranch, setNewBranch] = useState({
        tencn: '',
        diachi: '',
        sdt: '',
        tgmocua: '08:00',
        tgdongcua: '17:00'
    });

    const COLORS = ['#0056b3', '#3b82f6', '#60a5fa', '#93c5fd'];

    // Fetch Data
    const fetchData = async () => {
        try {
            const [statsRes, chartRes, sourceRes, branchesRes] = await Promise.all([
                axios.get(`${API_URL}/stats`),
                axios.get(`${API_URL}/revenue-chart`, { params: { period: viewMode } }),
                axios.get(`${API_URL}/revenue-structure`),
                axios.get(`${API_URL}/branches`)
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (chartRes.data.success) setRevenueData(chartRes.data.data);
            if (sourceRes.data.success) {
                // Map colors to data
                const mappedSource = sourceRes.data.data.map((item: any, idx: number) => ({
                    ...item,
                    color: COLORS[idx % COLORS.length]
                }));
                setSourceData(mappedSource);
            }
            if (branchesRes.data.success) setBranches(branchesRes.data.data);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [viewMode]);

    const handleOpenAddModal = () => {
        setEditingBranchId(null);
        setNewBranch({ tencn: '', diachi: '', sdt: '', tgmocua: '08:00', tgdongcua: '17:00' });
        setIsAddBranchOpen(true);
    };

    const handleEditBranch = (branch: any) => {
        setEditingBranchId(branch.macn);
        setNewBranch({
            tencn: branch.tencn,
            diachi: branch.diachi || '',
            sdt: branch.sdt || '',
            tgmocua: branch.tgmocua || '08:00',
            tgdongcua: branch.tgdongcua || '17:00'
        });
        setIsAddBranchOpen(true);
    };

    const handleDeleteBranch = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa chi nhánh này không? Hành động này không thể hoàn tác.')) return;
        try {
            const res = await axios.delete(`${API_URL}/branches/${id}`);
            if (res.data.success) {
                fetchData();
            }
        } catch (error: any) {
            console.error("Failed to delete branch", error);
            // Handle specific constraint error or generic
            if (error.response?.status === 400) {
                alert(error.response.data.message);
            } else {
                alert("Failed to delete branch");
            }
        }
    };

    const handleSaveBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let res;
            if (editingBranchId) {
                res = await axios.put(`${API_URL}/branches/${editingBranchId}`, newBranch);
            } else {
                res = await axios.post(`${API_URL}/branches`, newBranch);
            }

            if (res.data.success) {
                setIsAddBranchOpen(false);
                setNewBranch({ tencn: '', diachi: '', sdt: '', tgmocua: '08:00', tgdongcua: '17:00' });
                setEditingBranchId(null);
                fetchData(); // Refresh list
            }
        } catch (error) {
            console.error("Failed to save branch", error);
            alert("Failed to save branch");
        }
    };

    // Chart Y-Axis Dynamic Max
    const maxRevenue = Math.max(...revenueData.map((d: any) => Number(d.revenue)), 0);
    const yAxisMax = maxRevenue > 0 ? Math.ceil((maxRevenue * 1.2) / 10000000) * 10000000 : 10000000;

    const StatCard = ({ icon: Icon, label, value, subtext, change }: any) => (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50/50 rounded-lg">
                    <Icon className="w-5 h-5 text-[#0056b3]" />
                </div>
                <span className={`text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${Number(change) >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                    <TrendingUp size={10} className={Number(change) < 0 ? 'rotate-180' : ''} />
                    {Math.abs(change)}%
                </span>
            </div>
            <div>
                <div className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">{value}</div>
                <div className="text-sm text-slate-500 font-medium">{label}</div>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-110px)] flex flex-col overflow-hidden">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">

                {/* Left Column: Stats & Charts */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar pb-4 hide-scrollbar">
                    {/* Executive Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                        <StatCard icon={DollarSign} label="Doanh thu" value={formatCurrency(stats.revenue.value)} change={stats.revenue.change} />
                        <StatCard icon={Users} label="Khách hàng" value={stats.customers.value} change={stats.customers.change} />
                        <StatCard icon={Briefcase} label="Hóa đơn" value={stats.invoices.value} change={stats.invoices.change} />
                        <StatCard icon={Activity} label="Lượt khám" value={stats.exams.value} change={stats.exams.change} />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 gap-6 shrink-0">
                        {/* Monthly Revenue */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Doanh thu Theo {viewMode === 'month' ? 'Tháng' : 'Năm'}</h3>
                                <div className="flex gap-2 text-xs font-medium text-slate-500">
                                    <span
                                        onClick={() => setViewMode('month')}
                                        className={`px-2 py-1 rounded cursor-pointer transition-colors ${viewMode === 'month' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50'}`}
                                    >
                                        Tháng này
                                    </span>
                                    <span
                                        onClick={() => setViewMode('year')}
                                        className={`px-2 py-1 rounded cursor-pointer transition-colors ${viewMode === 'year' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50'}`}
                                    >
                                        Năm nay
                                    </span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={revenueData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12 }}
                                        tickFormatter={(val) => formatCurrency(val)}
                                        domain={[0, yAxisMax]}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F8FAFC' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [formatCurrency(value), 'Doanh thu']}
                                    />
                                    <Bar dataKey="revenue" fill="#0056b3" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Service Source Analysis */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 w-full">
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Cơ cấu nguồn thu</h3>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">Phân tích tỷ trọng doanh thu từ các nguồn dịch vụ chính.</p>
                                <div className="space-y-4">
                                    {sourceData.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: item.color }}></div>
                                                <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full md:w-[240px] h-[240px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sourceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            cornerRadius={4}
                                        >
                                            {sourceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-400 font-medium">Tổng</div>
                                        <div className="text-sm font-bold text-slate-700">100%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Branch Management */}
                <div className="lg:col-span-4 bg-white border border-slate-100 shadow-sm rounded-xl h-full flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="font-bold text-slate-800">Chi Nhánh</h3>
                            <p className="text-xs text-slate-500 mt-1">{branches.length} chi nhánh hoạt động</p>
                        </div>

                        <Dialog.Root open={isAddBranchOpen} onOpenChange={setIsAddBranchOpen}>
                            <Dialog.Trigger asChild>
                                <button onClick={handleOpenAddModal} className="p-2 bg-[#0056b3] text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow active:scale-95">
                                    <Plus size={18} />
                                </button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-overlayShow z-50" />
                                <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-2xl focus:outline-none z-50">
                                    <Dialog.Title className="text-xl font-bold mb-1 text-slate-800">{editingBranchId ? 'Chỉnh Sửa Chi Nhánh' : 'Thêm Chi Nhánh'}</Dialog.Title>
                                    <Dialog.Description className="text-sm text-slate-500 mb-6">
                                        {editingBranchId ? 'Cập nhật thông tin chi nhánh.' : 'Nhập thông tin chi nhánh mới vào hệ thống.'}
                                    </Dialog.Description>
                                    <form onSubmit={handleSaveBranch} className="space-y-4">
                                        <fieldset className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Tên chi nhánh <span className="text-red-500">*</span></label>
                                            <input className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                placeholder="VD: Chi nhánh Quận 1"
                                                value={newBranch.tencn} onChange={e => setNewBranch({ ...newBranch, tencn: e.target.value })} required />
                                        </fieldset>
                                        <fieldset className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Địa chỉ</label>
                                            <input className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                placeholder="VD: 123 Đường ABC..."
                                                value={newBranch.diachi} onChange={e => setNewBranch({ ...newBranch, diachi: e.target.value })} />
                                        </fieldset>
                                        <fieldset className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                                            <input className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                placeholder="028..."
                                                value={newBranch.sdt} onChange={e => setNewBranch({ ...newBranch, sdt: e.target.value })} />
                                        </fieldset>
                                        <div className="flex gap-4">
                                            <fieldset className="flex-1 flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-slate-700">Giờ mở</label>
                                                <input type="time" className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    value={newBranch.tgmocua} onChange={e => setNewBranch({ ...newBranch, tgmocua: e.target.value })} />
                                            </fieldset>
                                            <fieldset className="flex-1 flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-slate-700">Giờ đóng</label>
                                                <input type="time" className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    value={newBranch.tgdongcua} onChange={e => setNewBranch({ ...newBranch, tgdongcua: e.target.value })} />
                                            </fieldset>
                                        </div>
                                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                            <button type="button" onClick={() => setIsAddBranchOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 text-slate-600 transition-colors">Hủy bỏ</button>
                                            <button type="submit" className="px-4 py-2 bg-[#0056b3] text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">{editingBranchId ? 'Cập nhật' : 'Lưu chi nhánh'}</button>
                                        </div>
                                    </form>
                                    <Dialog.Close asChild>
                                        <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close">
                                            <X size={18} />
                                        </button>
                                    </Dialog.Close>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="space-y-3">
                            {branches.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
                                    <MapPin size={40} className="mb-3 opacity-20" />
                                    <p className="text-sm">Chưa có chi nhánh nào</p>
                                </div>
                            ) : branches.map((branch) => (
                                <div key={branch.macn} className="p-4 border border-slate-100 rounded-xl hover:shadow-md hover:border-blue-100 transition-all group bg-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-3xl -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800 text-sm">{branch.tencn}</h4>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditBranch(branch)} className="text-slate-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                                                <button onClick={() => handleDeleteBranch(branch.macn)} className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </div>

                                        <div className="text-xs text-slate-500 mb-3 space-y-1.5">
                                            <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" /> {branch.diachi || 'N/A'}</div>
                                            <div className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {branch.sdt || 'N/A'}</div>
                                        </div>

                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                                            <span className="text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium">
                                                {branch.tgmocua?.slice(0, 5) || '--'} - {branch.tgdongcua?.slice(0, 5) || '--'}
                                            </span>
                                            <span className="text-sm font-extrabold text-[#0056b3]">{formatCurrency(branch.revenue)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
