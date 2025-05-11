import { Routes, Route } from "react-router-dom";
import ChatScreen from "./pages/ChatScreen";

function App() {
 

  return (
    <>
      <Routes>
        <Route path="/" element={<ChatScreen />} />
      </Routes>
    </>
  )
}

export default App
