import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeLayout from './layout/HomeLayout';
import Home from './pages/Home';
import UserManager from './pages/UserManager';
import TripManager from './pages/TripManager';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Routes dùng layout */}
                <Route element={<HomeLayout />}>
                    <Route path='/home' element={<Home />} />
                    <Route path='/user-manager' element={<UserManager />} />
                    <Route path='/trip-manager' element={<TripManager />} />
                </Route>
            </Routes>
        </Router>
    );
}



export default App;