import { Header } from "./components/Header/Header";
import { Footer } from "./components/footer/Footer";
import { Outlet } from "react-router-dom";

export const Pages = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
