import { customEmojiEntries } from "@/utils/messages/customEmoji";
import Image from "next/image";

export default function CustomEmojiPicker({
  onSelect,
}: {
  onSelect: (emojiCode: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2 p-2 bg-black border border-white/10 rounded-lg shadow z-50">
      {customEmojiEntries.map(([code, url]) => (
        <button
          key={code}
          onClick={() => onSelect(code)}
          title={code}
          className="hover:bg-white/10 cursor-pointer rounded p-1"
        >
          <Image src={url} alt={code} width={44} height={44} />
        </button>
      ))}
    </div>
  );
}
