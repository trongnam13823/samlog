import { BrowserRouter, Routes, Route } from 'react-router';
import TableList from './pages/tables/TableList';
import TableCreate from './pages/tables/TableCreate';
import GameList from './pages/games/GameList';
import GameCreateCopyEdit from './pages/games/GameCreateCopyEdit';
import GameDetail from './pages/games/GameDetail';
import ErrorBoundary from './components/ErrorBoundary';
import RootLayout from './components/layouts/RootLayout';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const handleClick = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path='/' element={<RootLayout />}>
            <Route index element={<TableList />} />
            <Route path='create' element={<TableCreate />} />
            <Route path='tables/:tableId/games' element={<GameList />} />
            <Route
              path='tables/:tableId/games/:gameId/action/:action'
              element={<GameCreateCopyEdit />}
            />
            <Route
              path='tables/:tableId/games/:gameId'
              element={<GameDetail />}
            />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
