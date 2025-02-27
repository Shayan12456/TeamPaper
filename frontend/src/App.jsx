import { Home, NotFoundError, SignIn, SignUp, DocDashboard, PrivatePage, TextEditor }  from "./pages/index"
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import MainFooterLayout from './components/layout/MainFooterLayout';
import MainNavbarLayout from './components/layout/MainNavbarLayout';
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
          {/* Navigation */}
          <MainNavbarLayout />

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
            <Route
                path="/document"
                element={
                  <ProtectedRoute>
                    <DocDashboard />
                  </ProtectedRoute>
                  }/>
            <Route path="/text-editor/:id" element={
              <ProtectedRoute>
                <TextEditor />
              </ProtectedRoute>
              } />
            <Route path="*" element={<NotFoundError />} />
          </Routes>

          {/* Footer */}
          <MainFooterLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;