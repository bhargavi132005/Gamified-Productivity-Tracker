import Navbar from './Navbar';

const AppLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto p-4">
        {children}
      </main>
    </>
  );
};

export default AppLayout;
