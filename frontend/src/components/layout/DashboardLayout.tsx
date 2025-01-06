import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster";

export function DashboardLayout() {
    return (
        <div className="min-h-screen">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
            <Toaster />
        </div>
    );
} 