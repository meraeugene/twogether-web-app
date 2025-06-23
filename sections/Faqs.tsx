"use client";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";

const Faqs = () => {
  const faqs = [
    {
      question: "Is Twogether free to use?",
      answer: "Yes! Twogether is completely free for now.",
    },
    {
      question: "Do I need an account?",
      answer:
        "Yes, sign in with Google to get your profile, history, and sync features.",
    },
    {
      question: "Can I watch with people in different locations?",
      answer:
        "Absolutely. Twogether is built to let people connect no matter the distance.",
    },
    {
      question: "Can I create private watch parties?",
      answer: "Yes, every session has a private chat and a unique invite code.",
    },
    {
      question: "Can I use Twogether on mobile?",
      answer: "Yes, Twogether works on most modern mobile browsers.",
    },
    {
      question: "Is it only for couples?",
      answer:
        "No! While it's couple-friendly, you can watch with any friend or group.",
    },
  ];

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <section id="faqs" className="px-6 py-24 border-b border-white/10 ">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-[family-name:var(--font-geist-sans)]">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 backdrop-blur-lg"
          >
            <button
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              className="w-full cursor-pointer flex justify-between items-center text-left text-white/90 font-semibold text-lg font-[family-name:var(--font-geist-sans)]"
            >
              {faq.question}
              <FaChevronDown
                className={`transition-transform ${
                  openFAQ === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {openFAQ === index && (
              <p className="mt-3 text-white/70 text-lg font-[family-name:var(--font-geist-mono)]">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faqs;
