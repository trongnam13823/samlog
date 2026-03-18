import { Outlet } from 'react-router';

export default function RootLayout() {
  return (
    <div className='flex h-svh flex-col'>
      <main className='mb-(--footer-height) flex h-svh flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto p-5'>
        <Outlet />
      </main>
    </div>
  );
}
