import type { HomeData } from './types';

export const homeData: HomeData = {
  name: 'Ollie Gannon',
  tagline: 'programmer · filmmaker · photographer',
  bio: [
    'Hello! I\'m Ollie — a programmer, filmmaker and photographer based in the UK. I love building things, capturing moments, and telling stories through code and camera.',
    'This site is a collection of my work across all three disciplines. Explore the tabs above to see what I\'ve been making.',
  ],
  photos: [
    {
      src: '/media/home/photo-1.jpg',
      alt: 'A sample photo',
      rotate: -4,
      top: '8%',
      left: '2%',
      width: '200px',
    },
    {
      src: '/media/home/photo-2.jpg',
      alt: 'Another sample photo',
      rotate: 3,
      top: '55%',
      left: '5%',
      width: '180px',
    },
    {
      src: '/media/home/photo-3.jpg',
      alt: 'Sample photo three',
      rotate: -2,
      top: '10%',
      left: '70%',
      width: '210px',
    },
    {
      src: '/media/home/photo-4.jpg',
      alt: 'Sample photo four',
      rotate: 5,
      top: '60%',
      left: '72%',
      width: '190px',
    },
  ],
};
