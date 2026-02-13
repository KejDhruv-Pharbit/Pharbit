import { Route, Routes } from "react-router"
import Auth from "./Pages/Auth"
import MedicalForm from "./Components/MedicalForm"


function App() {
  

  return (
    <>
      <Routes>
        <Route path="/" element={<Auth />} />
         <Route path="/Form" element={<MedicalForm/>} />
    </Routes>
    </>
  )
}

export default App
