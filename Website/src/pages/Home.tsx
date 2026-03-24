import React from 'react';
import Hero from '../components/Hero';
import Story from '../components/Story';
import LiveChat from '../components/LiveChat';
import Features from '../components/Features';
import Timeline from '../components/Timeline';
import WeatherWidget from '../components/WeatherWidget';
import Marketplace from '../components/Marketplace';
import AppShowcase from '../components/AppShowcase';
import PricingFAQ from '../components/PricingFAQ';
import FinalCTA from '../components/FinalCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Story />
      <LiveChat />
      <Features />
      <Timeline />
      <WeatherWidget />
      <Marketplace />
      <AppShowcase />
      <PricingFAQ />
      <FinalCTA />
    </>
  );
}
