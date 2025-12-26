import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import QueryMonitor from '../app/components/QueryMonitor';
import { Bell, Search, Settings, ChevronRight } from 'lucide-react';

export default function MainLayout() {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = ['Home', ...pathSegments.map(s => s.charAt(0).toUpperCase() + s.slice(1))];

    return (
        <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full relative">

                {/* Fixed Header */}
                <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm text-slate-500">
                        {breadcrumbs.map((item, index) => (
                            <div key={index} className="flex items-center">
                                {index > 0 && <ChevronRight size={14} className="mx-2 text-slate-400" />}
                                <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-[#0056b3]' : ''}>
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Global Search..."
                                className="pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0056b3] transition-colors w-64"
                            />
                        </div>

                        <button className="relative text-slate-500 hover:text-[#0056b3] transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <button className="text-slate-500 hover:text-[#0056b3] transition-colors">
                            <Settings size={20} />
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-[#333333]">Dr. Admin</div>
                                <div className="text-xs text-slate-500">System Administrator</div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#0056b3] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-blue-100">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-6 relative bg-[#F8F9FA]">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Floating Monitor */}
                <QueryMonitor />
            </div>
        </div>
    );
}
