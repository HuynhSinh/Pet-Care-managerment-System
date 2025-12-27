import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import HRManagement from './features/hr/HRManagement';
import ServicesManagement from './features/services/ServicesManagement';
import ProductsInventory from './features/products/ProductsInventory';
import CustomerManagement from './features/customers/CustomerManagement';
import PetRecords from './features/pets/PetRecords';
import MainLayout from './layouts/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Outlet />;
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/hr" element={<HRManagement />} />
                            <Route path="/services" element={<ServicesManagement />} />
                            <Route path="/products" element={<ProductsInventory />} />
                            <Route path="/customers" element={<CustomerManagement />} />
                            <Route path="/pets" element={<PetRecords />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
