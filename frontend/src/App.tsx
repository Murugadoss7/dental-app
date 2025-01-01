import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PatientList } from "@/components/patients/PatientList"
import { Toaster } from "@/components/ui/toaster"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container py-10">
        <h1 className="mb-8 text-3xl font-bold">Dental App</h1>
        <PatientList />
      </div>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App