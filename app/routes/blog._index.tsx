import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Blog | Coming Soon | Mavala Switzerland' },
    { name: 'description', content: 'Beauty tips, nail care advice, and product news from Mavala Switzerland. Coming Soon!' },
  ];
};

export default function BlogIndex() {
  return (
    <div className="pt-[104px] md:pt-[112px] min-h-screen bg-gradient-to-b from-white via-mavala-light-gray/30 to-white">
      {/* Coming Soon Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative Element */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-mavala-red/10 flex items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-mavala-red/20 flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 md:w-10 md:h-10 text-mavala-red" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
                    />
                  </svg>
                </div>
              </div>
              {/* Animated dots */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-mavala-red rounded-full animate-pulse" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-mavala-red/60 rounded-full animate-pulse delay-300" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl md:text-5xl font-display font-light tracking-[0.15em] uppercase text-mavala-dark mb-4">
            Blog Coming Soon
          </h1>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-mavala-red/30" />
            <div className="w-2 h-2 rounded-full bg-mavala-red" />
            <div className="w-12 h-px bg-mavala-red/30" />
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-mavala-gray mb-8 leading-relaxed">
            We're crafting something beautiful for you
          </p>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 mb-10">
            <p className="text-mavala-gray leading-relaxed mb-6">
              Our team is working hard to bring you the best beauty tips, nail care advice, 
              manicure tutorials, and skincare insights from Mavala Switzerland's experts.
            </p>
            
            {/* What's Coming */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { icon: '✨', label: 'Beauty Tips' },
                { icon: '💅', label: 'Nail Care' },
                { icon: '🎨', label: 'Tutorials' },
                { icon: '🌿', label: 'Skincare' },
              ].map((item) => (
                <div 
                  key={item.label}
                  className="p-4 rounded-xl bg-mavala-light-gray/50 hover:bg-mavala-light-gray transition-colors"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-xs uppercase tracking-wider text-mavala-gray font-medium">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <p className="text-sm text-mavala-gray">
              In the meantime, explore our products
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/collections"
                className="inline-flex items-center justify-center gap-2 bg-mavala-red text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-mavala-dark transition-colors rounded-sm"
              >
                Shop Collections
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link 
                to="/the-brand"
                className="inline-flex items-center justify-center gap-2 border border-mavala-dark text-mavala-dark px-8 py-3 text-sm uppercase tracking-wider hover:bg-mavala-dark hover:text-white transition-colors rounded-sm"
              >
                About Mavala
              </Link>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <p className="text-xs text-mavala-gray/70 uppercase tracking-wider">
              Stay tuned for updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

