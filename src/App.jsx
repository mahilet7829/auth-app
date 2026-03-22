import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Signup  from './component/Signup.jsx';
import Login   from './component/Login.jsx';
import Welcome from './component/Welcome.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup"   element={<Signup />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/welcome"  element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
  
}

export default App;