import Spline from '@splinetool/react-spline';

export default function Animation(){
    return(
        <>
          {/* Animation */}
          <main className="hidden md:block h-[800px] relative">
            <Spline className="w-full h-full" scene="https://prod.spline.design/buSPoWqJdGed8jgG/scene.splinecode" />
            <div className="absolute bottom-6 right-2 bg-[#00031b] text-white px-24 py-12 mb-[-10px] rounded-md text-sm"></div>
          </main>
        </>
    );
}