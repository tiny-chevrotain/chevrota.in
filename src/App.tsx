import { useState } from 'react';
import { Nav } from './components/Nav/Nav';
import type { Tab } from './components/Nav/Nav';

// These imports will be uncommented in later steps once the components exist:
// import { HomePage } from './components/pages/HomePage/HomePage';
// import { PortfolioPage } from './components/pages/PortfolioPage/PortfolioPage';
// import programmingItems from './data/programming.json';
// import filmmakingItems from './data/filmmaking.json';
// import photographyItems from './data/photography.json';

import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <>
      <Nav activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={{ padding: '2rem', animation: 'fadeIn 250ms ease forwards' }} className="page-enter">
        {activeTab === 'home' && (
          <div>
            <h1>Home — coming soon</h1>
            <p>HomePage component will go here.</p>
          </div>
        )}
        {activeTab === 'programming' && (
          <div>
            <h2>Programming</h2>
            <p>PortfolioPage component will go here.</p>
          </div>
        )}
        {activeTab === 'filmmaking' && (
          <div>
            <h2>Filmmaking</h2>
            <p>PortfolioPage component will go here.</p>
          </div>
        )}
        {activeTab === 'photography' && (
          <div>
            <h2>Photography</h2>
            <p>PortfolioPage component will go here.</p>
          </div>
        )}
      </main>
    </>
  );
}
