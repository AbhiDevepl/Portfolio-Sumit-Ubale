import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from './Layout'

/**
 * Routes map 1:1 onto the URLs the static site served; netlify.toml 301s the
 * old `.html` paths onto these.
 */
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    entry: 'src/Layout.tsx',
    children: [
      {
        index: true,
        lazy: () => import('./routes/Home'),
      },
      {
        path: 'gallery',
        lazy: () => import('./routes/Gallery'),
      },
      {
        path: 'albums',
        lazy: () => import('./routes/Albums'),
      },
      {
        path: 'portfolio',
        lazy: () => import('./routes/Portfolio'),
      },
      {
        path: 'service/:slug',
        lazy: () => import('./routes/Service'),
      },
      {
        path: 'wedding-photographer-shrigonda',
        lazy: () => import('./routes/WeddingPhotographerShrigonda'),
      },
      {
        path: 'pre-wedding-shoot-ahilyanagar',
        lazy: () => import('./routes/PreWeddingShootAhilyanagar'),
      },
      {
        path: 'cinematic-wedding-films-maharashtra',
        lazy: () => import('./routes/CinematicWeddingFilmsMaharashtra'),
      },
      {
        path: 'candid-photographer-maharashtra',
        lazy: () => import('./routes/CandidPhotographerMaharashtra'),
      },

      // 404 — must be the last route
      {
        path: '*',
        lazy: () => import('./routes/NotFound'),
      },
    ],
  },
]

export default routes