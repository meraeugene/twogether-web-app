type FloatingType = "poster" | "user" | "status" | "badge";

interface FloatingElement {
  type: FloatingType;
  top: string;
  left: string;
  rotate: number;
  delay: number;
  content?: string;
}

export const FLOATING_DATA: FloatingElement[] = [
  { type: "poster", top: "5%", left: "2%", rotate: -15, delay: 0 },
  { type: "poster", top: "25%", left: "8%", rotate: 10, delay: 0.8 },
  { type: "poster", top: "50%", left: "4%", rotate: -8, delay: 1.5 },
  { type: "poster", top: "75%", left: "7%", rotate: 12, delay: 0.3 },
  { type: "poster", top: "90%", left: "15%", rotate: -5, delay: 2.1 },

  { type: "poster", top: "8%", left: "85%", rotate: 12, delay: 0.5 },
  { type: "poster", top: "30%", left: "90%", rotate: -10, delay: 1.2 },
  { type: "poster", top: "55%", left: "82%", rotate: 15, delay: 1.9 },
  { type: "poster", top: "80%", left: "88%", rotate: -12, delay: 0.7 },
  { type: "poster", top: "15%", left: "75%", rotate: 5, delay: 2.5 },

  { type: "poster", top: "-5%", left: "30%", rotate: 20, delay: 1.4 },
  { type: "poster", top: "95%", left: "60%", rotate: -15, delay: 0.9 },

  {
    type: "user",
    top: "20%",
    left: "18%",
    rotate: -8,
    delay: 0.8,
    content: "https://i.pravatar.cc/150?u=1",
  },
  {
    type: "user",
    top: "65%",
    left: "15%",
    rotate: 10,
    delay: 1.2,
    content: "https://i.pravatar.cc/150?u=2",
  },
  {
    type: "user",
    top: "45%",
    left: "88%",
    rotate: -15,
    delay: 2.1,
    content: "https://i.pravatar.cc/150?u=3",
  },
  {
    type: "user",
    top: "82%",
    left: "80%",
    rotate: 5,
    delay: 1.1,
    content: "https://i.pravatar.cc/150?u=4",
  },

  {
    type: "status",
    top: "58%",
    left: "75%",
    rotate: 2,
    delay: 0.3,
    content: "Watching Interstellar",
  },
  {
    type: "status",
    top: "12%",
    left: "65%",
    rotate: -4,
    delay: 1.7,
    content: "Live: 2.4k active",
  },
  {
    type: "status",
    top: "40%",
    left: "12%",
    rotate: 4,
    delay: 2.2,
    content: "Friends Online",
  },
  {
    type: "status",
    top: "92%",
    left: "40%",
    rotate: 0,
    delay: 1.1,
    content: "New Episodes Daily",
  },

  {
    type: "badge",
    top: "85%",
    left: "25%",
    rotate: 15,
    delay: 0.5,
    content: "9.8",
  },
  {
    type: "badge",
    top: "5%",
    left: "45%",
    rotate: -10,
    delay: 2.5,
    content: "Trending",
  },
  {
    type: "badge",
    top: "35%",
    left: "2%",
    rotate: -20,
    delay: 1.8,
    content: "Top 10",
  },
];
