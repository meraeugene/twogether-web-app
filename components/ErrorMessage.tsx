"use client";

export default function ErrorMessage({
  title = "Something went wrong.",
  message = "We couldn’t load this content right now. Please try again later.",
  hint,
}: {
  title?: string;
  message?: string;
  hint?: string;
}) {
  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-black px-6 py-20 sm:py-28">
      <div className="max-w-md w-full text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-500">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-red-300">{message}</p>
        {hint && (
          <p className="text-sm sm:text-base text-red-200/70 italic border-t border-red-500/20 pt-4">
            {hint}
          </p>
        )}
      </div>
    </section>
  );
}
