import { Outlet } from 'react-router';
import Header from '../Header';

export default function RootLayout() {
  return (
    <div className='flex h-svh flex-col'>
      <Header />

      <main className='mt-[calc(10px+var(--header-height))] mb-[calc(10px+var(--footer-height))] flex h-svh flex-1 flex-col overflow-y-auto px-5'>
        <Outlet />
      </main>
    </div>
  );
}
