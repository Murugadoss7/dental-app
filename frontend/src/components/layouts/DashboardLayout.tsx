import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X, Users, Calendar, FileText, DollarSign, Settings } from 'lucide-react';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const menuItems = [
        { icon: Users, label: 'Patients', path: '/patients' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: FileText, label: 'Medical Records', path: '/records' },
        { icon: DollarSign, label: 'Billing', path: '/billing' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Sidebar Toggle */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="h-20 flex items-center justify-center border-b">
                    <h1 className="text-2xl font-bold text-primary">Dental App</h1>
                </div>
                <nav className="mt-8">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`lg:ml-64 min-h-screen transition-all duration-200`}>
                <header className="h-20 bg-white shadow-sm flex items-center px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                </header>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout; 