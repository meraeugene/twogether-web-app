import {
  FaVideo,
  FaUsers,
  FaComments,
  FaHeart,
  FaPaperPlane,
  FaListAlt,
} from "react-icons/fa";

const features = [
  {
    icon: <FaUsers />,
    title: "Custom User Profiles",
    description:
      "Build a profile that reflects your movie style and personality. Others can follow you to discover what you’re watching and loving.",
  },
  {
    icon: <FaVideo />,
    title: "Full Movie Playback",
    description:
      "Stream your favorite movies and shows directly on the platform. No ads, no fuss — just pure uninterrupted viewing.",
  },
  {
    icon: <FaComments />,
    title: "Comment System",
    description:
      "Start conversations under any movie or episode. Share your thoughts, react to hot takes, and meet like-minded fans.",
  },
  {
    icon: <FaHeart />,
    title: "Emoji Reactions",
    description:
      "Drop quick emoji reactions to scenes you love. Let others know how you feel without saying a word.",
  },
  {
    icon: <FaPaperPlane />,
    title: "Private Chat",
    description:
      "Message friends directly from their profiles or during a shared session. It's like having your own movie DMs.",
  },
  {
    icon: <FaListAlt />,
    title: "Recommendation Feed",
    description:
      "Follow people you trust and see what they’re watching. Build your queue from real recommendations, not just AI suggestions.",
  },
];

const Features = () => {
  return (
    <section id="features" className="px-6 py-24 border-b border-white/10">
      <h2 className="text-3xl md:text-5xl font-bold text-center mb-20 font-[family-name:var(--font-geist-sans)]">
        6 Reasons to Join
      </h2>
      <div className="grid md:grid-cols-2 gap-14 max-w-5xl mx-auto relative">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative flex flex-col text-left p-6 pt-12  backdrop-blur-3xl bg-white/10 border  border-white/10 rounded-lg shadow-md hover:border-red-500 transition"
          >
            {/* Red Number */}
            <div
              className="absolute -top-11 -left-4 text-7xl font-extrabold text-black"
              style={{
                textShadow:
                  "-2px -2px 0 #ff0000, 2px -2px 0 #ff0000, -2px 2px 0 #ff0000, 2px 2px 0 #ff0000",
              }}
            >
              {index + 1}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-white mb-2 font-[family-name:var(--font-geist-sans)]">
              {feature.title}
            </h3>

            {/* Optional subtitle */}
            <p className="text-white/80 font-[family-name:var(--font-geist-mono)]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
