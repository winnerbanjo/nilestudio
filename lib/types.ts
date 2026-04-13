export type StudioAction =
  | "clean-studio"
  | "change-color"
  | "upgrade-model"
  | "create-campaign";

export type StudioOption =
  | "white-studio"
  | "beige-studio"
  | "dark-luxury"
  | "white"
  | "black"
  | "red"
  | "gold"
  | "pink"
  | "wine"
  | "cream"
  | "navy"
  | "emerald"
  | "olive"
  | "silver"
  | "mocha"
  | "nigerian-female-face"
  | "nigerian-male-face"
  | "african-editorial-face"
  | "owambe-party"
  | "dinner-date"
  | "weekend-brunch"
  | "evening-event";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  creditsRemaining: number;
  creditLimit: number;
  creditPeriod: string;
};
