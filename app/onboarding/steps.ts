import { OnboardingForm } from "../../types/formTypes";

export const steps: { key: keyof OnboardingForm; prompt: string }[] = [
  { key: "username", prompt: "What should we call you?" },
  { key: "relationship_status", prompt: "What's your relationship status?" },
  { key: "social_intent", prompt: "What are you hoping to do here?" },
  { key: "favorite_genres", prompt: "What are your favorite genres?" },
  { key: "favorite_moods", prompt: "What kind of moods do you enjoy?" },
  { key: "prefers", prompt: "Do you prefer movies, shows, or both?" },
];
