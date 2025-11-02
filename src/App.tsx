import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeLayout from './layout/HomeLayout';
import Home from './pages/Home';
import UserManager from './pages/UserManager';
import RouteManager from './pages/RouteManager';
import VehicleManager from './pages/VehicleManager';
import Notification from './pages/Notification';
import 'leaflet/dist/leaflet.css';
import DriverManager from './pages/DriverManager';

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
                    <Route path='/route-manager' element={<RouteManager />} />
                    <Route path='/vehicle-manager' element={<VehicleManager />} />
                    <Route path='/driver-manager' element={<DriverManager />} />
                    <Route path='/notification' element={<Notification />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;