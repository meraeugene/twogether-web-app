export default function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="grid min-h-40 place-items-center" aria-live="polite">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/15 border-t-red-500" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
