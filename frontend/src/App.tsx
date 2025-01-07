import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PatientList } from "@/components/patients/PatientList";
import { DoctorList } from "@/components/doctors/DoctorList";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { AppointmentSettings } from "@/components/settings/AppointmentSettings";
import { Dashboard } from "@/pages/Dashboard";
import { lazy, Suspense } from "react";

const Treatment = lazy(() => import("@/pages/Treatment"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/settings" element={<AppointmentSettings />} />
            <Route
              path="/patients/:patientId/treatment"
              element={<Suspense fallback={<div>Loading...</div>}><Treatment /></Suspense>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;