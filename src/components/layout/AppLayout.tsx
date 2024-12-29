import { AppSidebar } from "./Sidebar";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </>
  );
};