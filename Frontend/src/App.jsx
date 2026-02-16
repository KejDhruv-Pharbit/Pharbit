import { Route, Routes } from "react-router"
import Auth from "./Pages/Auth"
import MedicalForm from "./Components/MedicalForm"
import PendingRequests from "./Pages/Admin/PendingRequest"


function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/Form" element={<MedicalForm />} />
        <Route path="/Pending" element={<PendingRequests />} />
      </Routes>
    </>
  )
}

export default App
