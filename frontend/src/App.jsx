import { Home, Credentials, NotFoundError, SignIn, SignUp }  from "./pages/index"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Test from "./pages/Test";

function App() {
  return (
    <Router>
      {/* Navigation */}
      <Navbar />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Test />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<NotFoundError />} />
      </Routes>

      {/* Footer */}
      <Footer />
    </Router>
  );
}

export default App;