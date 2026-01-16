import { useEffect, useRef } from 'react';
import MessageCard from './MessageCard';

export default function MessageFeed({ messages, loading, onLike, onFlag, onReply, autoScroll = false }) {
  const feedRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  if (loading && messages.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 p-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No hay mensajes aún</p>
        <p className="text-sm mt-2">Sé el primero en compartir una tasa o recomendación</p>
      </div>
    );
  }

  return (
    <div ref={feedRef} className="space-y-3">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onLike={onLike}
          onFlag={onFlag}
          onReply={onReply}
        />
      ))}
      {loading && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          Cargando más mensajes...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
