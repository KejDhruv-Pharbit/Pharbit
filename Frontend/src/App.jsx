import { Route, Routes } from "react-router"
import Auth from "./Pages/Auth"


function App() {
  

  return (
    <>
      <Routes>
          <Route path="/" element={<Auth/>} />
    </Routes>
    </>
  )
}

export default App
