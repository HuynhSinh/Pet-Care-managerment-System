import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Briefcase, TrendingUp, Activity, Plus, Edit, Trash2, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

const monthlyRevenue = [
    { month: 'T1', revenue: 45000 },
    { month: 'T2', revenue: 52000 },
    { month: 'T3', revenue: 48000 },
    { month: 'T4', revenue: 61000 },
    { month: 'T5', revenue: 55000 },
    { month: 'T6', revenue: 67000 },
];

const serviceSourceData = [
    { name: 'Khám bệnh', value: 45, color: '#0056b3' },
    { name: 'Spa & Grooming', value: 30, color: '#3b82f6' },
    { name: 'Bán lẻ', value: 15, color: '#60a5fa' },
    { name: 'Khác', value: 10, color: '#93c5fd' },
];

const branchesData = [
    { id: 1, name: 'Chi nhánh Trung Tâm', address: '123 Đường A, HCM', phone: '028.3838.3838', status: 'Hoạt động', revenue: '1.2 Tỷ' },
    { id: 2, name: 'Chi nhánh Phía Tây', address: '456 Đường B, HCM', phone: '028.3939.3939', status: 'Hoạt động', revenue: '800 Tr' },
    { id: 3, name: 'Chi nhánh Phía Bắc', address: '789 Đường C, HN', phone: '024.1111.2222', status: 'Bảo trì', revenue: '0' },
];

const StatCard = ({ icon: Icon, label, value, subtext }: any) => (
    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-full">
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-[#E6F0FA] rounded-md">
                <Icon className="w-6 h-6 text-[#0056b3]" />
            </div>
            {subtext && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{subtext}</span>}
        </div>
        <div>
            <div className="text-2xl font-bold text-[#333333] mb-1">{value}</div>
            <div className="text-sm text-slate-500 font-medium tracking-wide">{label}</div>
        </div>
    </div>
);

export default function Dashboard() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">

            {/* Left Column: Stats & Charts (scrollable) */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                {/* Executive Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={DollarSign} label="Doanh thu" value="1.8 Tỷ" subtext="+12.5%" />
                    <StatCard icon={Users} label="Khách hàng" value="3,780" subtext="+5.2%" />
                    <StatCard icon={Briefcase} label="Hóa đơn" value="945" subtext="Ổn định" />
                    <StatCard icon={Activity} label="Lượt khám" value="124" subtext="+8.1%" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Monthly Revenue */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-[#333333] mb-4">Doanh thu Theo Tháng</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                <Bar dataKey="revenue" fill="#0056b3" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Service Source Analysis */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center">
                        <div className="flex-1 w-full">
                            <h3 className="text-lg font-bold text-[#333333] mb-2">Cơ cấu nguồn thu</h3>
                            <p className="text-sm text-slate-500 mb-6">Tỷ trọng doanh thu giữa các mảng.</p>
                            <div className="space-y-3">
                                {serviceSourceData.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-bold">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={serviceSourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {serviceSourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Branch Management (CHI_NHANH) */}
            <div className="lg:col-span-4 bg-white border-l border-slate-200 h-full flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-[#333333]">Chi Nhánh (CHI_NHANH)</h3>
                    <button className="p-2 bg-[#0056b3] text-white rounded hover:bg-blue-700 transition shadow-sm">
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="space-y-4">
                        {branchesData.map((branch) => (
                            <div key={branch.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow group bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-800 text-sm">{branch.name}</h4>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-slate-400 hover:text-blue-600"><Edit size={14} /></button>
                                        <button className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500 mb-2 space-y-1">
                                    <div className="flex items-center gap-1"><MapPin size={12} /> {branch.address}</div>
                                    <div className="flex items-center gap-1"><Phone size={12} /> {branch.phone}</div>
                                </div>

                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${branch.status === 'Hoạt động' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {branch.status}
                                    </span>
                                    <span className="text-sm font-bold text-[#0056b3]">{branch.revenue}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
