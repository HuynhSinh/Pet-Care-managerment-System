import { Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function QueryMonitor() {
    const [executionTime, setExecutionTime] = useState(0);

    useEffect(() => {
        // Simulate query execution time fluctuation
        const interval = setInterval(() => {
            setExecutionTime(Math.floor(Math.random() * 40) + 15);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-slate-200 shadow-lg rounded-full px-4 py-2 flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="relative">
                <Activity size={16} className="text-[#0056b3]" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <div className="text-xs font-mono text-slate-600">
                <span className="font-semibold text-[#333333]">Last Query Execution:</span>{' '}
                <span className={executionTime > 50 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'}>
                    {executionTime} ms
                </span>
            </div>
        </div>
    );
}
