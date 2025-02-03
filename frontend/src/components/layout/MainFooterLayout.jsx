import Footer from './Footer';
import { useLocation } from 'react-router-dom';

// ✅ Conditional Navbar Logic
function MainFooterLayout() {
    const location = useLocation();
  
    return (
      <>
        {location.pathname.startsWith("/text-editor/") ? "" : <Footer />}      
      </>
    );
  }

export default MainFooterLayout;