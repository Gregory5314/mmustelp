import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Name is too short").max(80),
  scholarCode: z.string().trim().min(3, "Required").max(40),
  course: z.string().trim().min(2, "Required").max(120),
  phone: z.string().trim().min(7, "Invalid phone").max(20).regex(/^[0-9 +\-()]+$/, "Digits only"),
  email: z.string().trim().email("Invalid email").max(120),
  nationalId: z.string().trim().min(4, "Required").max(20).regex(/^[0-9]+$/, "Digits only"),
  mentoringSchool: z.string().trim().min(2, "Required").max(120),
});

export type Profile = z.infer<typeof profileSchema>;

export const defaultProfile: Profile = {
  fullName: "Gregory Omar",
  scholarCode: "011/6857/2019",
  course: "B.Sc. Electrical Engineering, Year 3",
  phone: "254 799 221 5087",
  email: "gomar@gmail.com",
  nationalId: "30572821",
  mentoringSchool: "ST. LUKE'S HIGH SCHOOL",
};

const KEY = "mmust-elp-profile";

export function loadProfile(): Profile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultProfile;
    const parsed = profileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(p: Profile) {
  window.localStorage.setItem(KEY, JSON.stringify(p));
}
