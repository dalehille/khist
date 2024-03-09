import { Routes, Route } from "react-router-dom";
import Header from './Header';
import History from './History';
import Home from './Home';

function App({ setMode }) {

  return (
    <>
      <Header setMode={setMode} />
      <Routes>
        <Route index element={<Home />} />
        <Route path=":routeId" element={<History />} />
      </Routes>
    </>
  )
}


export default App