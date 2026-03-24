import React from 'react';
import ScrollExpandMedia from './ui/scroll-expansion-hero';

export default function Story() {
  return (
    <div className="bg-primary text-on-primary">
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="/Section2Video.mp4"
        bgImageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuDzP3x8YAAOsR27j6pQFF7TcYivGcWU5kSNRPqOF7ktHKa2THDzmLU20JCYVNhW6vMAlW5FikIyreKOryqAjdPh8RZ9KeBCHjwdxoXSIM6hPd5MM7_tAmmrIlddg3Hkyf8pWcgSfkVWrAbMvekyhQYoWI14LY4NkzniywneLO0Y0jTke4Bgq3LConJ5c5601ZJCCFDNHBpc7RUqYSlS5oe66Pk1dbhLhLZi7LbLILiokTaBLK4RNZqFOng5ipB-14vZwdJaxsJ4JtLg"
        title="Expert Knowledge"
        date="Story of Ramesh"
        scrollToExpand="Keep scrolling to expand"
        textBlend={true}
      >
        <div className="max-w-4xl mx-auto space-y-12 pb-32">
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary leading-tight">
             Most farmers lack access to real-time agronomists. We built Anaaj.ai to ensure no crop fails due to lack of information.
          </h2>
          <div className="bg-surface-container p-8 md:p-12 rounded-[2.5rem] relative">
            <span className="text-9xl text-primary/20 absolute -top-4 -left-2 font-serif">"</span>
            <p className="text-2xl md:text-3xl font-headline font-medium text-primary leading-snug relative z-10 italic">
              I finally have an expert in my pocket who speaks my language. My yields have improved and my costs plummeted thanks to immediate localized advice.
            </p>
            <p className="mt-8 text-on-surface-variant font-label uppercase tracking-widest font-bold">
              — RAMESH K., PUNJAB
            </p>
          </div>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
