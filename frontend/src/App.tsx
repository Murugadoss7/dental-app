import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PatientList } from "@/components/patients/PatientList";
import { DoctorList } from "@/components/doctors/DoctorList";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { AppointmentSettings } from "@/components/settings/AppointmentSettings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<div>Dashboard Coming Soon</div>} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/settings" element={<AppointmentSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;