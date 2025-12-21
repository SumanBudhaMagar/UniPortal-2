import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* HEADER */}
      <header className="py-3 px-4 flex items-center justify-center gap-6">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center space-x-2">
            <img src="/favicon.ico" alt="logo" className="w-50"/>
          </div>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-[#661800]">Kathmandu University</h1>
          <div className="h-1 w-full bg-[#F2A900] mt-1"></div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-4 text-center text-sm mt-auto">
        Attention! This system is for official authorized use only. All content on this system is owned by
        your university. Unauthorized use is prohibited and may be subject to criminal prosecution. Usage
        may be monitored and recorded.
      </footer>
    </div>
  );
}