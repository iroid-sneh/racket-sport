import { Routes, Route } from "react-router-dom"
import SchedulePage from "@/pages/SchedulePage"
import ActivitiesPage from "@/pages/ActivitiesPage"
import CustomersPage from "@/pages/CustomersPage"
import PaymentsPage from "@/pages/PaymentsPage"
import ReportsPage from "@/pages/ReportsPage"
import SetupPage from "@/pages/SetupPage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SchedulePage />} />
      <Route path="/activities" element={<ActivitiesPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/setup" element={<SetupPage />} />
    </Routes>
  )
}
