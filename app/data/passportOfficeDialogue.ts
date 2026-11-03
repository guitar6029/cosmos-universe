export type PassportOfficeChoice = "apply" | "returning" | "browse";

export interface DialogueScreen {
  lines: string[];
  choices?: { id: PassportOfficeChoice; label: string }[];
}

export const PASSPORT_OFFICE_DIALOGUE: Record<"opening" | PassportOfficeChoice, DialogueScreen> = {
  opening: {
    lines: ["Oh! A visitor! Welcome to the CosmoPort Passport Bureau! How can I help you today?"],
    choices: [
      { id: "apply", label: "I'd like to apply for a passport!" },
      { id: "returning", label: "I'm a returning traveler." },
      { id: "browse", label: "Just looking around." },
    ],
  },
  apply: {
    lines: [
      "Splendid! A new traveler! Let's get your paperwork started.",
      "The application counter is being prepared. Please check back soon for the next chapter of your voyage.",
    ],
  },
  returning: {
    lines: [
      "Welcome back! Always a pleasure to see a familiar face!",
      "Present your credentials at the identity-verification desk.",
    ],
  },
  browse: {
    lines: [
      "Of course! Feel free to look around. Just don't disturb the paperwork robot—he's having a difficult morning.",
    ],
  },
};

export const openingDialogueStep = (): "opening" => "opening";
export const dialogueFor = (step: "opening" | PassportOfficeChoice): DialogueScreen =>
  PASSPORT_OFFICE_DIALOGUE[step];
