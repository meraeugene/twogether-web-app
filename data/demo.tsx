import Image from "next/image";

export const data = [
  {
    title: "Search for a Movie or TV Show",
    content: (
      <div>
        <p className="mb-6 text-sm md:text-base lg:text-lg leading-relaxed font-[family-name:var(--font-geist-mono)] text-gray-300  max-w-2xl">
          Start by searching for a movie or TV show you’d like to recommend. You
          can explore anything that resonates with you or your friends.
        </p>
        <Image
          src="/demo/step1.png"
          width={500}
          height={500}
          alt="Search step"
          className="object-cover w-full h-auto border border-white/10 rounded-md shadow-sm"
        />
      </div>
    ),
  },
  {
    title: "Add a Personal Comment",
    content: (
      <div>
        <p className="mb-6 text-sm md:text-base lg:text-lg leading-relaxed font-[family-name:var(--font-geist-mono)] text-gray-300  max-w-2xl">
          Tell others why you love this film or series. A short note or favorite
          moment makes your recommendation feel personal and authentic.
        </p>
        <Image
          src="/demo/step2.png"
          width={500}
          height={500}
          alt="Comment step"
          className="object-cover w-full h-auto border border-white/10 rounded-md shadow-sm"
        />
      </div>
    ),
  },
  {
    title: "Rate the Movie or Show",
    content: (
      <div>
        <p className="mb-6 text-sm md:text-base lg:text-lg leading-relaxed font-[family-name:var(--font-geist-mono)] text-gray-300 max-w-2xl">
          Add a 1 to 5 heart rating — even half hearts like 4.5 — to show how
          strongly you recommend it. Your rating adds a fun, personal touch to
          your recommendations.
        </p>
        <Image
          src="/demo/step3.png"
          width={500}
          height={500}
          alt="Rating step"
          className="object-cover w-full h-auto border border-white/10 rounded-md shadow-sm"
        />
      </div>
    ),
  },
  {
    title: "Choose Visibility Settings",
    content: (
      <div>
        <p className="mb-6 text-sm md:text-base lg:text-lg leading-relaxed font-[family-name:var(--font-geist-mono)] text-gray-300  max-w-2xl">
          Decide who can see your recommendation — keep it private, share with
          friends, or make it public.
        </p>
        <Image
          src="/demo/step4.png"
          width={500}
          height={500}
          alt="Visibility step"
          className="object-cover w-full h-auto border border-white/10 rounded-md shadow-sm"
        />
      </div>
    ),
  },
];
