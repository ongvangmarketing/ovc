import React from "react";

export default function FeaturesGrid({ design }: { design: any }) {
  const columns = parseInt(design?.columns || "3");
  const gridClass = columns === 2 ? "grid-cols-1 md:grid-cols-2" : columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-3";

  const defaultFeatures = [
    { title: "Lightning Fast", description: "Built with the latest technologies for incredible performance and seamless user experiences.", icon: "zap" },
    { title: "Bank-grade Security", description: "Your data is protected with enterprise-level encryption and compliance standards.", icon: "shield" },
    { title: "24/7 Premium Support", description: "Our dedicated team of experts is always here to help you succeed.", icon: "headset" },
    { title: "Infinite Scalability", description: "Robust architecture that grows seamlessly with your business needs.", icon: "trending-up" },
    { title: "Advanced Analytics", description: "Deep insights and reporting dashboards to drive better decisions.", icon: "bar-chart" },
    { title: "Seamless Integrations", description: "Connect with all your favorite tools and platforms in one click.", icon: "link" },
  ];
  
  const features = design?.features || defaultFeatures.slice(0, columns * (columns === 2 ? 2 : 1));

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />;
      case 'shield': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
      case 'headset': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />;
      case 'trending-up': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;
      case 'bar-chart': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
      case 'link': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />;
      default: return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />;
    }
  };

  return (
    <div className="w-full py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm text-blue-600 font-bold tracking-widest uppercase mb-3">Features</h2>
          <p className="mt-2 text-3xl leading-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
            {design?.title || "A better way to build"}
          </p>
          <p className="mt-5 max-w-2xl text-xl text-gray-500 mx-auto leading-relaxed">
            {design?.subtitle || "Everything you need to succeed, all in one place. Discover the features that make our platform stand out from the crowd."}
          </p>
        </div>

        <div className="mt-12">
          <div className={`grid gap-8 ${gridClass}`}>
            {features.map((f: any, i: number) => (
              <div key={i} className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl mb-6 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {renderIcon(f.icon)}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
