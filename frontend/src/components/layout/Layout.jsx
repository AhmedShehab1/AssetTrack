import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function Layout({ children }) {
  return (
    <div className="bg-surface-page font-body-md text-on-surface min-h-screen flex antialiased">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopNav />
        {children}
      </div>
    </div>
  );
}