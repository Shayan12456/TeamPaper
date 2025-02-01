import Navbar from './Navbar';
import DocNavbar from './DocNavbar';
import { useLocation } from 'react-router-dom';

// ✅ Conditional Navbar Logic
function MainLayout() {
    const location = useLocation();
  
    return (
      <>
        {location.pathname === "/document" ? <DocNavbar /> : <Navbar />}
      </>
    );
  }

export default MainLayout;