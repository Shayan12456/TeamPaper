import Navbar from './Navbar';
import DocNavbar from './DocNavbar';
import { useLocation } from 'react-router-dom';

// ✅ Conditional Navbar Logic
function MainNavbarLayout() {
    const location = useLocation();
  
    return (
      <>
        {location.pathname === "/document" ? <DocNavbar /> :  location.pathname.startsWith("/text-editor/") ? "" : <Navbar />}
      </>
    );
  }

export default MainNavbarLayout;