'use client';

import { Mic, PhoneOff, PhoneCall } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface TransportBarProps {
  onSendMessage: (message: string) => void;
  onCallToggle: () => void;
  onMuteToggle: () => void;
}

export default function TransportBar({
  onSendMessage,
  onCallToggle,
  onMuteToggle,
}: TransportBarProps) {
  const { isCallActive, isMuted, connectionState } = useAppStore();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center space-x-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        className={isMuted ? 'text-red-500' : 'text-white'}
        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        <Mic className={isMuted ? 'fill-red-500' : ''} />
      </Button>

      <Input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="max-w-md bg-white/10 border-white/20 text-white"
        disabled={!isCallActive}
      />

      <Button
        variant={isCallActive ? 'destructive' : 'default'}
        size="icon"
        onClick={onCallToggle}
        title={isCallActive ? 'End Call' : 'Start Call'}
      >
        {isCallActive ? <PhoneOff /> : <PhoneCall />}
      </Button>
    </div>
  );
}
