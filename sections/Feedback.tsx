"use client";

import { FeedbackColumn } from "@/components/ui/FeedbackCard";
import { motion } from "motion/react";

import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";

type Testimonials = {
  id: string;
  name: string;
  text: string;
  is_new: boolean;
};

const Feedback = () => {
  const { data: testimonials } = useSWR<Testimonials[]>(
    "/api/testimonials",
    fetcher
  );

  return (
    <section className="py-20 px-7  relative min-h-screen flex items-center justify-center text-center overflow-hidden lg:flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <div className="container z-10 mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center  mx-auto"
        >
          <h2 className="text-3xl font-extrabold md:text-5xl max-w-3xl font-sans text-white ">
            <span className="text-red-500">Trusted</span> by Movie Lovers
            Everywhere
          </h2>
          <p className="text-base md:text-lg text-center xl:text-xl text-gray-300  mx-auto font-[family-name:var(--font-geist-mono)]   lg:text-lg leading-relaxed  mt-5 opacity-75">
            Discover how we’ve made a difference for our users.
          </p>
        </motion.div>

        {/* Testimonials */}
        {testimonials && (
          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            <FeedbackColumn
              testimonials={testimonials.slice(0, 3)}
              duration={15}
            />
            <FeedbackColumn
              testimonials={testimonials.slice(3, 6)}
              className="hidden md:block"
              duration={19}
            />
            <FeedbackColumn
              testimonials={testimonials.slice(6, 9)}
              className="hidden lg:block"
              duration={17}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Feedback;
