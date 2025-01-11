// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AdminProvider } from './contexts/AdminContext';
import store from './store';

// Layout Components
import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected User Pages
import Dashboard from './pages/Dashboard';
import DisasterDetail from './pages/DisasterDetail';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDisasterDetail from './pages/admin/DisasterDetail';
import DisasterForm from './components/DisasterForm';

// Route Guards
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Provider store={store}>
      <AdminProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected User Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/disasters/:id" 
                  element={
                    <PrivateRoute>
                      <DisasterDetail />
                    </PrivateRoute>
                  } 
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/disasters/new" 
                  element={
                    <AdminRoute>
                      <DisasterForm mode="create" />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/disasters/:id/edit" 
                  element={
                    <AdminRoute>
                      <DisasterForm mode="edit" />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/disasters/:id" 
                  element={
                    <AdminRoute>
                      <AdminDisasterDetail />
                    </AdminRoute>
                  } 
                />

                {/* Catch-all Route for 404 */}
                <Route 
                  path="*" 
                  element={
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                      <p className="text-gray-600 mb-4">Halaman tidak ditemukan</p>
                      <button 
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Kembali
                      </button>
                    </div>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </AdminProvider>
    </Provider>
  );
}

export default App;