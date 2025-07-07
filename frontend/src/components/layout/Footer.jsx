import { FileText, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className="bg-white text-gray-600 py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="">
            <div>
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-black" />
                <span className="ml-2 text-xl font-bold text-black">
                  TeamPaper
                </span>
              </div>
              <p className="text-sm">
                Making document collaboration seamless and efficient for teams
                worldwide.
              </p>
            </div>
          </div>
          <div className="border-t mt-12 pt-8">
            <div className="flex justify-center text-sm">
              &copy; {new Date().getFullYear()} TeamPaper. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
