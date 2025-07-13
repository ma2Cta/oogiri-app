import { RealGameRoom } from '@/components/game/real-game-room';

interface GamePageProps {
  params: {
    sessionId: string;
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { sessionId } = await params;
  
  return (
    <RealGameRoom sessionId={sessionId} />
  );
}