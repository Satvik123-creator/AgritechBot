import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vendors } from '../data/vendors';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function VendorProfile() {
  const { id } = useParams();
  const vendor = vendors.find(v => v.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!vendor) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Vendor Not Found</h1>
        <Link to="/" className="text-tertiary-fixed font-bold underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-tertiary-fixed selection:text-on-tertiary-fixed flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-8"
        >
          {/* Hero Banner */}
          <div className="relative w-full h-80 md:h-[450px] rounded-[3rem] overflow-hidden mb-12 shadow-2xl">
            <img src={vendor.heroImage} alt={vendor.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
              <span className="text-tertiary-fixed font-bold uppercase tracking-widest text-sm mb-2">Verified Partner</span>
              <h1 className="text-5xl md:text-7xl font-headline font-bold text-white mb-4">{vendor.name}</h1>
              <p className="text-white/80 font-body text-xl md:text-2xl max-w-3xl">{vendor.bio}</p>
            </div>
            
            {/* Vendor Profile Picture Overlay */}
            <div className="absolute top-8 right-8 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-surface overflow-hidden shadow-2xl hidden md:block">
               <img src={vendor.image} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* About Section */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/20 shadow-sm">
                <h3 className="text-xl font-bold font-headline text-primary mb-4">About the Vendor</h3>
                <p className="text-on-surface-variant leading-relaxed font-body">{vendor.longBio}</p>
                <div className="mt-8 pt-8 border-t border-outline-variant/30 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <h4 className="text-2xl font-bold text-primary">{vendor.stats.posts}</h4>
                    <p className="text-[10px] items-center flex justify-center gap-1 uppercase tracking-widest text-on-surface-variant font-bold mt-1">Products</p>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-primary">{Math.floor(vendor.stats.followers / 1000)}k+</h4>
                    <p className="text-[10px] items-center flex justify-center gap-1 uppercase tracking-widest text-on-surface-variant font-bold mt-1">Followers</p>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-primary">{vendor.stats.following}</h4>
                    <p className="text-[10px] items-center flex justify-center gap-1 uppercase tracking-widest text-on-surface-variant font-bold mt-1">Following</p>
                  </div>
                </div>
                <button className="w-full mt-8 bg-tertiary-fixed text-on-tertiary-fixed py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                  Follow @{vendor.username}
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-primary font-headline">Explore Products</h2>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">{vendor.products.length} Items</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendor.products.map((product, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-sm border border-outline-variant/10 group cursor-pointer hover:shadow-xl transition-all"
                  >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-primary uppercase tracking-widest shadow-sm">
                        {product.tag}
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">{product.name}</h4>
                    <div className="flex justify-between items-center text-on-surface mt-4">
                      <span className="text-2xl font-bold text-tertiary-fixed">₹{product.price.toLocaleString('en-IN')}</span>
                      <button className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                        <span className="material-symbols-outlined">shopping_bag</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
