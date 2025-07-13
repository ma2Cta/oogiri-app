import Link from 'next/link';
import { UserNav } from "@/components/auth/user-nav";
import { RoomDetail } from "@/components/rooms/room-detail";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <Link href="/" className="hover:text-blue-600 transition-colors">Oogiri App</Link>
            </h1>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <RoomDetail roomId={roomId} />
      </main>
    </div>
  );
}