import { Outlet } from 'react-router';
import Header from '../Header';

export default function RootLayout() {
  return (
    <div className='flex h-svh flex-col'>
      <Header />

      <main className='mt-(--header-height) mb-(--footer-height) flex h-svh flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto p-5'>
        <Outlet />
      </main>
    </div>
  );
}
