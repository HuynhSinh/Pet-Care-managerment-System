import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Connection failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-white overflow-hidden">

            {/* Left Side - Branding / Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0056b3] relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0056b3] to-[#003d80]" />

                {/* Abstract Circles */}
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />

                <div className="relative z-10 text-white max-w-lg">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">PetCareX <br />Management System</h1>
                    <p className="text-xl text-blue-100 leading-relaxed opacity-90">
                        Professional veterinary practice management. Secure, efficient, and built for modern healthcare standards.
                    </p>

                    <div className="mt-12 flex items-center gap-4 text-sm font-medium text-blue-200">
                        <div className="px-3 py-1 bg-white/10 rounded-full">v2.4.0 Stable</div>
                        <div className="w-1 h-1 bg-blue-300 rounded-full" />
                        <div>Secure Server Connection</div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                    <div className="text-left mb-10">
                        <h2 className="text-3xl font-bold text-[#333333]">Welcome Back</h2>
                        <p className="text-slate-500 mt-2">Please enter your credentials to access the dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-100 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#333333]">Username ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#0056b3] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
                                    placeholder="Enter your ID"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#333333]">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#0056b3] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-[#0056b3] focus:ring-[#0056b3] border-slate-300 rounded" />
                                <span className="ml-2 text-sm text-slate-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-[#0056b3] hover:text-blue-700">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0056b3] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056b3] transition-all transform active:scale-[0.98]"
                        >
                            Login to Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
                        Protected by reCAPTCHA and subject to the PetCareX Privacy Policy.
                    </div>
                </div>
            </div>
        </div>
    );
}
