import { useState } from 'react';
import { Nav } from './components/Nav/Nav';
import type { Tab } from './components/Nav/Nav';
import { HomePage } from './components/pages/HomePage/HomePage';
import { PortfolioPage } from './components/pages/PortfolioPage/PortfolioPage';
import { BookingPage } from './components/pages/BookingPage/BookingPage';
import { BookingConfirmationPage } from './components/pages/BookingConfirmationPage/BookingConfirmationPage';
import programmingItems from './data/programming.json';
import filmmakingItems  from './data/filmmaking.json';
import photographyItems from './data/photography.json';
import type { PortfolioItem } from './data/types';
import './index.css';

const isBookingRoute = window.location.pathname.startsWith('/reserve_slot');
const isBookingConfirmationRoute = window.location.pathname.startsWith('/booking');

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  if (isBookingRoute) return <BookingPage />;
  if (isBookingConfirmationRoute) return <BookingConfirmationPage />;

  return (
    <>
      <Nav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'home' && <HomePage />}

      {activeTab === 'programming' && (
        <PortfolioPage
          key="programming"
          category="programming"
          items={programmingItems as PortfolioItem[]}
        />
      )}

      {activeTab === 'filmmaking' && (
        <PortfolioPage
          key="filmmaking"
          category="filmmaking"
          items={filmmakingItems as PortfolioItem[]}
        />
      )}

      {activeTab === 'photography' && (
        <PortfolioPage
          key="photography"
          category="photography"
          items={photographyItems as PortfolioItem[]}
        />
      )}
    </>
  );
}
