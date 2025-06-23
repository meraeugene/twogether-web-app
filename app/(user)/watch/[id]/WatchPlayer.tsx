export default function WatchPlayer({ url }: { url: string }) {
  return (
    <div className="aspect-video  rounded-md overflow-hidden shadow-lg">
      <iframe
        src={url}
        className="w-full h-full"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
