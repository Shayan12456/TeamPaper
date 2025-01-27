import { FileText, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer(){
    return (
      <>
        {/* Footer */}
        <footer className="bg-white text-gray-600 py-12 border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
                <div>
                <div className="flex items-center mb-4">
                    <FileText className="h-8 w-8 text-black" />
                    <span className="ml-2 text-xl font-bold text-black">TeamPaper</span>
                </div>
                <p className="text-sm">
                    Making document collaboration seamless and efficient for teams worldwide.
                </p>
                <div className="flex space-x-4 mt-4">
                    <a href="#twitter" className="text-gray-400 hover:text-black transition">
                    <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#github" className="text-gray-400 hover:text-black transition">
                    <Github className="h-5 w-5" />
                    </a>
                    <a href="#linkedin" className="text-gray-400 hover:text-black transition">
                    <Linkedin className="h-5 w-5" />
                    </a>
                </div>
                </div>
                <div>
                <h3 className="text-black font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                    <li><a href="#features" className="hover:text-black transition">Features</a></li>
                    <li><a href="#pricing" className="hover:text-black transition">Pricing</a></li>
                    <li><a href="#security" className="hover:text-black transition">Security</a></li>
                    <li><a href="#enterprise" className="hover:text-black transition">Enterprise</a></li>
                    <li><a href="#integrations" className="hover:text-black transition">Integrations</a></li>
                </ul>
                </div>
                <div>
                <h3 className="text-black font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                    <li><a href="#about" className="hover:text-black transition">About</a></li>
                    <li><a href="#careers" className="hover:text-black transition">Careers</a></li>
                    <li><a href="#blog" className="hover:text-black transition">Blog</a></li>
                    <li><a href="#press" className="hover:text-black transition">Press</a></li>
                    <li><a href="#contact" className="hover:text-black transition">Contact</a></li>
                </ul>
                </div>
                <div>
                <h3 className="text-black font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                    <li><a href="#documentation" className="hover:text-black transition">Documentation</a></li>
                    <li><a href="#tutorials" className="hover:text-black transition">Tutorials</a></li>
                    <li><a href="#support" className="hover:text-black transition">Support</a></li>
                    <li><a href="#api" className="hover:text-black transition">API</a></li>
                    <li><a href="#status" className="hover:text-black transition">System Status</a></li>
                </ul>
                </div>
            </div>
            <div className="border-t mt-12 pt-8">
                <div className="grid md:grid-cols-2 gap-4">
                <div className="text-sm">
                    &copy; {new Date().getFullYear()} TeamPaper. All rights reserved.
                </div>
                <div className="flex space-x-4 text-sm md:justify-end">
                    <a href="#privacy" className="hover:text-black transition">Privacy Policy</a>
                    <a href="#terms" className="hover:text-black transition">Terms of Service</a>
                    <a href="#cookies" className="hover:text-black transition">Cookie Settings</a>
                </div>
                </div>
            </div>
            </div>
        </footer>
      </>
    );
}