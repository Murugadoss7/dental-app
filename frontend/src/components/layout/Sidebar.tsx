import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    UserRound,
    Calendar,
    Settings,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Doctors", href: "/doctors", icon: UserRound },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    return (
        <div className="flex h-full w-64 flex-col bg-white border-r">
            {/* Logo */}
            <div className="flex h-16 items-center px-4 border-b">
                <span className="text-xl font-semibold">Dental App</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                                isActive
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
} 