import { TopNav } from "@/components/TopNav";
import { Sidebar } from "@/components/Sidebar";

export default function UserAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </>
  );
}
