import { FileText } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

export default function Navbar(){
    return (
      <>
        {/* Navigation */}
        <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <Link to="/home">
                    <div className="flex items-center">
                        <FileText className="h-8 w-8 text-black" />
                        <span className="ml-2 text-xl font-bold text-black">TeamPaper</span>
                    </div>
                </Link>               
                <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-black">Features</a>
                <a href="#solutions" className="text-gray-600 hover:text-black">Solutions</a>
                <a href="#pricing" className="text-gray-600 hover:text-black">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-black">Testimonials</a>
                <button className="cursor-pointer bg-black text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black border border-solid border-black px-4 py-[6px] transition">
                    <a href="/login">Log In</a>
                </button>
                <button className="cursor-pointer bg-white text-black border border-solid border-black px-4 py-[6px] rounded-lg hover:bg-black hover:text-white transition">
                    <a href="/signup" >Sign Up</a>
                </button>
                </div>
            </div>
            </div>
        </nav>
      </>
    );
}