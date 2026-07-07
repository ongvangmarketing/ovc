import React from "react";

export default function HeroSection({ design }: { design: any }) {
  const align = design?.align || "left";
  const alignClass = align === "left" ? "text-left items-start" : align === "right" ? "text-right items-end" : "text-center items-center";

  // Premium stock image placeholder
  const heroImage = design?.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80";

  return (
    <div className="relative w-full bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
          <main className={`mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28 flex flex-col ${alignClass}`}>
            <div className="sm:text-center lg:text-left w-full">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">{design?.title || "Build your next great idea"}</span>{' '}
                <span className="block text-blue-600 xl:inline">{design?.subtitle || "with our platform"}</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 leading-relaxed">
                {design?.description || "Experience the most powerful tools designed for modern creators. Build faster, scale perfectly, and manage effortlessly with our all-in-one suite."}
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                {design?.button_text && (
                  <div className="rounded-md shadow">
                    <a
                      href={design?.button_link || "#"}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      {design.button_text}
                    </a>
                  </div>
                )}
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-all duration-300"
                  >
                    Live Demo
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full shadow-2xl"
          src={heroImage}
          alt="Hero background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent lg:via-transparent"></div>
      </div>
    </div>
  );
}
