import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import TaskDetails from './pages/TaskDetails';
import EmployeeList from './pages/EmployeeList';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/admin" element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/employee" element={
                <PrivateRoute role="employee">
                  <EmployeeDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/employees" element={
                <PrivateRoute role="admin">
                  <EmployeeList />
                </PrivateRoute>
              } />
              
              <Route path="/admin/tasks" element={
                <PrivateRoute role="admin">
                  <Tasks />
                </PrivateRoute>
              } />
              
              <Route path="/tasks/:id" element={
                <PrivateRoute>
                  <TaskDetails />
                </PrivateRoute>
              } />
              
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
