import ReactPlayer from "react-player";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative aspect-video bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <ReactPlayer
        url={videoUrl}
        width="100%"
        height="100%"
        controls
        onReady={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </div>
  );
}
