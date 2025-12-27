import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Package,
    UserCircle,
    Cat,
    LogOut,
    Menu,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { icon: LayoutDashboard, label: 'Trang chủ', path: '/' },
    { icon: Users, label: 'Nhân sự', path: '/hr' },
    { icon: Stethoscope, label: 'Dịch vụ', path: '/services' },
    { icon: Package, label: 'Sản phẩm', path: '/products' },
    { icon: UserCircle, label: 'Khách hàng', path: '/customers' },
    { icon: Cat, label: 'Thú cưng', path: '/pets' },
];

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const { logout } = useAuth();

    return (
        <aside
            className={`h-screen bg-[#0056b3] text-white flex flex-col relative shadow-xl transition-all duration-300 ease-in-out ${isExpanded ? 'w-[250px]' : 'w-[80px]'}`}
        >
            {/* Logo & Toggle Area */}
            <div className="h-[60px] flex items-center px-4 border-b border-blue-400/30">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white hover:bg-blue-600 p-2 rounded-lg transition-colors mr-3"
                >
                    <Menu size={24} />
                </button>

                {isExpanded && (
                    <div className="flex items-center gap-2 animate-in fade-in duration-300">
                        <span className="font-bold text-lg tracking-wide whitespace-nowrap">PetCareX</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center px-4 py-3 mx-2 rounded-lg transition-colors duration-200 group relative
              ${isActive
                                ? 'bg-white text-[#0056b3] font-bold shadow-md'
                                : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                            }
              ${isExpanded ? 'justify-start' : 'justify-center'}
            `}
                    >
                        <item.icon size={22} className="shrink-0" strokeWidth={2} />

                        {isExpanded ? (
                            <span className="ml-3 text-sm whitespace-nowrap overflow-hidden">{item.label}</span>
                        ) : (
                            // Tooltip standard (CSS only)
                            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-blue-400/30">
                <button
                    onClick={logout}
                    className={`flex items-center w-full rounded-lg px-2 py-2 text-blue-100 hover:bg-red-500 hover:text-white transition-colors ${isExpanded ? 'justify-start' : 'justify-center'}`}
                >
                    <LogOut size={22} />
                    {isExpanded && <span className="ml-3 text-sm font-medium">Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
}
