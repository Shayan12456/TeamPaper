import { Home, NotFoundError, SignIn, SignUp, DocDashboard, PrivatePage }  from "./pages/index"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Footer from './components/layout/Footer';
import MainLayout from './components/layout/MainLayout';
import Test from "./pages/Test";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
      {/* Navigation */}
      <MainLayout />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/privatepage" element={
          <ProtectedRoute>
            <PrivatePage />
          </ProtectedRoute>
              }/>
        <Route path="*" element={<NotFoundError />} />
        <Route
            path="/document"
            element={
              <ProtectedRoute>
                <DocDashboard />
              </ProtectedRoute>
              }/>
      </Routes>

      {/* Footer */}
      <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;