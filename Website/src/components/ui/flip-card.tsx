import React from 'react';

export interface FlipCardData {
  name: string;
  username: string;
  image: string;
  bio: string;
  stats: { following: number; followers: number; posts?: number };
  socialLinks?: { linkedin?: string; github?: string; twitter?: string };
}

export const FlipCard = ({ data }: { data: FlipCardData }) => {
  return (
    <div className="group w-full min-w-[85vw] md:min-w-[350px] h-[500px] [perspective:2000px] cursor-pointer">
      <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-xl rounded-[2.5rem]">
        
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[2.5rem] overflow-hidden bg-surface-container-lowest border border-outline-variant/10 flex flex-col">
          <img 
            src={data.image} 
            alt={data.name} 
            className="w-full h-2/3 object-cover" 
          />
          <div className="p-8 h-1/3 flex flex-col justify-center items-center bg-surface-container-lowest">
            <h3 className="text-3xl font-headline font-bold text-primary mb-1">{data.name}</h3>
            <p className="text-on-surface-variant font-label uppercase tracking-widest text-sm">@{data.username}</p>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2.5rem] bg-primary text-on-primary p-10 flex flex-col justify-between border border-primary/20 shadow-2xl">
            <div className="text-center mt-4">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-6 border-4 border-tertiary-fixed shadow-lg">
                <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-headline font-bold mb-2">{data.name}</h3>
              <p className="text-tertiary-fixed text-xs uppercase tracking-widest font-bold mb-6">Verified Vendor</p>
              <p className="text-lg leading-relaxed text-on-primary font-body">{data.bio}</p>
            </div>
            
            <div className="flex justify-around items-center border-t border-white/20 pt-6 mt-6">
               <div className="text-center">
                 <p className="text-3xl font-bold font-headline">{data.stats.followers}</p>
                 <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mt-1">Followers</p>
               </div>
               <div className="text-center">
                 <p className="text-3xl font-bold font-headline">{data.stats.following}</p>
                 <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mt-1">Following</p>
               </div>
               {data.stats.posts && (
                 <div className="text-center">
                   <p className="text-3xl font-bold font-headline">{data.stats.posts}</p>
                   <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mt-1">Products</p>
                 </div>
               )}
            </div>
        </div>

      </div>
    </div>
  );
};
