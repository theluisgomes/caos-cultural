import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BottomNav } from '../components/nav/BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <>
      <Header />
      <div className="pb-20 md:pb-0">
        <Outlet />
      </div>
      <Footer />
      <BottomNav />
    </>
  );
};
