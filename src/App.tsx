import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
// import Register from './pages/Register';
import HomeLayout from './layout/HomeLayout';
import Home from './pages/Home';
import UserManager from './pages/UserManager';
import RouteManager from './pages/RouteManager';
import VehicleManager from './pages/VehicleManager';
import Notification from './pages/Notification';
import DriverManager from './pages/DriverManager';
import TripManager from './pages/TripManager';
import Update_Firmware from './pages/Update_Firmware';
import 'leaflet/dist/leaflet.css';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Welcome />} />
				<Route path="/login" element={<Login />} />
				{/* <Route path="/register" element={<Register />} /> */}

				<Route element={<HomeLayout />}>
					<Route
						path="/home"
						element={
							<ProtectedRoute>
								<Home />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/user-manager"
						element={
							<ProtectedRoute requiredRole="admin">
								<UserManager />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/driver-manager"
						element={
							<ProtectedRoute requiredRole='admin'>
								<DriverManager />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/route-manager"
						element={
							<ProtectedRoute requiredRole='admin'>
								<RouteManager />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/trip-manager"
						element={
							<ProtectedRoute>
								<TripManager />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/vehicle-manager"
						element={
							<ProtectedRoute requiredRole='admin'>
								<VehicleManager />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/notification"
						element={
							<ProtectedRoute requiredRole='admin'>
								<Notification />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/update-firmware"
						element={
							<ProtectedRoute requiredRole='admin'>
								<Update_Firmware />
							</ProtectedRoute>
						}
					/>
				</Route>
			</Routes>
		</Router>
	);
}

export default App;