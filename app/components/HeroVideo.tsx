interface HeroVideoProps {
  videoId?: string;
}

export function HeroVideo({ videoId = "21ldJiKpid8" }: HeroVideoProps) {
  // YouTube embed - modern parameters only
  // NO deprecated params: vq, hd, quality, showinfo
  const videoParams = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId,
    playsinline: '1',
    controls: '0',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0',
  }).toString();

  const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${videoParams}`;

  return (
    <section className="w-full bg-white">
      {/* 
        Mobile: Exact 16:9 container - NO ZOOM, video fills perfectly
        Desktop: Cover behavior with slight crop for taller container
      */}
      
      {/* Mobile - 16:9 aspect ratio, video fills exactly (no crop) */}
      <div className="md:hidden relative w-full overflow-hidden bg-black" style={{ height: '56.25vw' }}>
        <iframe
          src={videoUrl}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          allow="autoplay; fullscreen; picture-in-picture; accelerometer; gyroscope"
          title="Mavala Hero Video"
          loading="eager"
        />
      </div>

      {/* Desktop - 92vh with cover behavior */}
      <div className="hidden md:block relative w-full h-[92vh] overflow-hidden bg-black">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: 'max(100vw, 163.56vh)',  /* 92vh × 16/9 = 163.56vh */
            height: 'max(92vh, 56.25vw)',
          }}
        >
          <iframe
            src={videoUrl}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture; accelerometer; gyroscope"
            title="Mavala Hero Video"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
