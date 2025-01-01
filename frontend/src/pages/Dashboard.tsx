import React from 'react';
import { Users, Calendar, DollarSign, Activity } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: string;
}

const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <h3 className="text-2xl font-semibold mt-1">{value}</h3>
                {trend && (
                    <p className={`text-sm mt-1 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {trend} from last month
                    </p>
                )}
            </div>
            <Icon className="h-8 w-8 text-primary opacity-80" />
        </div>
    </div>
);

const Dashboard = () => {
    const stats = [
        {
            title: 'Total Patients',
            value: '1,234',
            icon: Users,
            trend: '+5.25%'
        },
        {
            title: 'Appointments Today',
            value: '12',
            icon: Calendar,
            trend: '+2.5%'
        },
        {
            title: 'Revenue This Month',
            value: '$12,345',
            icon: DollarSign,
            trend: '+8.3%'
        },
        {
            title: 'Active Treatments',
            value: '45',
            icon: Activity,
            trend: '+3.7%'
        }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
                    {/* Add appointment list component here */}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Upcoming Treatments</h2>
                    {/* Add treatments list component here */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 