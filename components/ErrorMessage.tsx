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
    <section className="pt-28 flex justify-center items-center min-h-screen text-center bg-black text-red-500">
      <div className="px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-red-400">{message}</p>
        {hint && <p className="mt-4 text-base text-red-300 italic">{hint}</p>}
      </div>
    </section>
  );
}
