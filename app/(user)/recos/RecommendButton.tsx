import Link from "next/link";
import { IoMdAdd } from "react-icons/io";

const RecommendButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <Link
        prefetch
        href="/recommend"
        className="bg-white  transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer text-black p-3 rounded-full shadow-lg flex items-center gap-2 font-semibold"
      >
        <IoMdAdd className="w-5 h-5 text-lg text-red-500 font-extrabold" />
      </Link>
    </div>
  );
};

export default RecommendButton;
