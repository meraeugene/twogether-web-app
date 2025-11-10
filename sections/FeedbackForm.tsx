"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { submitFeedback } from "@/actions/feedbackActions";
import { mutate } from "swr";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

const FeedbackForm = () => {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("text", text.trim());

    startTransition(async () => {
      const result = await submitFeedback(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        mutate("/api/testimonials");
        toast.success("Thank you for your feedback!");
        setName("");
        setText("");
      }
    });
  };

  return (
    <section className="pb-24 font-[family-name:var(--font-geist-sans)] relative pt-20 px-6 md:px-12 lg:px-24">
      {/* Red Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 font-[family-name:var(--font-geist-sans)] text-white">
          We Value Your <span className="text-red-500">Feedback</span>
        </h1>
        <p className=" text-base md:text-lg xl:text-xl text-gray-300 max-w-2xl mx-auto font-[family-name:var(--font-geist-mono)] ">
          Let us know how your experience has been with Twogether — your
          suggestions, thoughts, and love help us grow!
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-w-xl mx-auto space-y-8  mt-14   "
      >
        <div className="text-left">
          <label
            htmlFor="name"
            className="block text-base font-medium mb-2 text-white/80"
          >
            Your Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-3  rounded-sm border border-white/10 bg-transparent text-white font-[family-name:var(--font-geist-mono)] placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            placeholder="Joe Goldberg"
          />
        </div>

        <div className="text-left">
          <label
            htmlFor="text"
            className="block text-base font-medium mb-2 text-white/80"
          >
            Your Feedback
          </label>
          <textarea
            id="text"
            name="text"
            rows={6}
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full font-[family-name:var(--font-geist-mono)] px-5 py-3 rounded-sm border border-white/10 bg-transparent text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none transition"
            placeholder="Share what you love, or tell us how we can improve..."
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full font-[family-name:var(--font-geist-mono)] flex cursor-pointer items-center justify-center gap-3 bg-red-600 text-white px-6 py-3 text-lg rounded-md font-semibold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Sending...
            </>
          ) : (
            <>
              <HiOutlineChatBubbleLeftRight className="h-5 w-5" />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </section>
  );
};

export default FeedbackForm;
