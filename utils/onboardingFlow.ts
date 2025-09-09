import { OnboardingContextType } from "../app/(onboarding)/_layout";

export type OnboardingRoute =
  | "index"
  | "birthdate"
  | "sex"
  | "attribution"
  | "ethnicity"
  | "measurements"
  | "parents"
  | "shoe"
  | "dream"
  | "puberty"
  | "underarm"
  | "facial"
  | "growth"
  | "shoulders"
  | "odor"
  | "acne"
  | "muscles"
  | "voice"
  | "slower"
  | "shave"
  | "analysis"
  | "product"
  | "trust"
  | "reviews"
  | "short"
  | "generating"
  | "results"
  | "projection"
  ;

export interface OnboardingStep {
  id: OnboardingRoute;
  route: OnboardingRoute;
  label?: string;
  /** Weight used for progress; default 1 */
  weight?: number;
  /** Whether this step should be counted in progress UI */
  includeInProgress?: boolean;
  /** Whether this step uses the shared OnboardingLayout (header/progress/footer) */
  usesOnboardingLayout?: boolean;
  /** Optional predicate to dynamically skip this step */
  skip?: (ctx: OnboardingContextType) => boolean;
  /** Optional dynamic next decision */
  next?: (ctx: OnboardingContextType) => OnboardingRoute | undefined;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "index", route: "index", label: "Welcome" },
  { id: "birthdate", route: "birthdate", label: "Birthdate" },
  { id: "sex", route: "sex", label: "Sex" },
  { id: "attribution", route: "attribution", label: "Attribution" },

  { id: "ethnicity", route: "ethnicity", label: "Ethnicity" },
  { id: "measurements", route: "measurements", label: "Measurements" },
  { id: "parents", route: "parents", label: "Parents" },
  { id: "shoe", route: "shoe", label: "Shoe" },
  { id: "dream", route: "dream", label: "Dream Height" },
  // { id: "puberty", route: "puberty", label: "Puberty" },
  // Puberty subflow
  { id: "underarm", route: "underarm", label: "Underarm" },
  { id: "facial", route: "facial", label: "Facial" },
  { id: "growth", route: "growth", label: "Growth" },
  { id: "shoulders", route: "shoulders", label: "Shoulders" },
  { id: "odor", route: "odor", label: "Odor" },
  { id: "acne", route: "acne", label: "Acne" },
  { id: "muscles", route: "muscles", label: "Muscles" },
  { id: "voice", route: "voice", label: "Voice" },
  { id: "slower", route: "slower", label: "Slower" },
  { id: "shave", route: "shave", label: "Shave" },
  // Analysis & trust
  { id: "analysis", route: "analysis", label: "Analysis" },
  { id: "product", route: "product", label: "Product" },
  { id: "trust", route: "trust", label: "Trust" },
  { id: "reviews", route: "reviews", label: "Reviews" },
  { id: "short", route: "short", label: "Short" },
  // Generating is an action/loading step — exclude from progress and layout
  {
    id: "generating",
    route: "generating",
    label: "Generating",
    includeInProgress: false,
    usesOnboardingLayout: false,
    weight: 0,
  },
  { id: "results", route: "results", label: "Results" },
  { id: "projection", route: "projection", label: "Projection" },
];

function getVisibleSteps(ctx: OnboardingContextType): OnboardingStep[] {
  return ONBOARDING_STEPS.filter((s) => !s.skip || !s.skip(ctx));
}

export function getProgressTotals(
  currentRoute: OnboardingRoute,
  ctx: OnboardingContextType
) {
  const steps = getVisibleSteps(ctx).filter(
    (s) => s.includeInProgress !== false
  );
  const totalWeight = steps.reduce((acc, s) => acc + (s.weight ?? 1), 0);
  const index = steps.findIndex((s) => s.route === currentRoute);
  const completedWeight = steps
    .slice(0, Math.max(0, index + 1))
    .reduce((acc, s) => acc + (s.weight ?? 1), 0);
  const percent = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  return { totalWeight, completedWeight, percent, index, steps };
}

export function getNextRoute(
  currentRoute: OnboardingRoute,
  ctx: OnboardingContextType
): OnboardingRoute | undefined {
  const steps = getVisibleSteps(ctx);
  const idx = steps.findIndex((s) => s.route === currentRoute);
  if (idx < 0) return undefined;
  const current = steps[idx];
  const dynamic = current.next ? current.next(ctx) : undefined;
  if (dynamic) return dynamic;
  return steps[idx + 1]?.route;
}

export function getPrevRoute(
  currentRoute: OnboardingRoute,
  ctx: OnboardingContextType
): OnboardingRoute | undefined {
  const steps = getVisibleSteps(ctx);
  const idx = steps.findIndex((s) => s.route === currentRoute);
  if (idx <= 0) return undefined;
  return steps[idx - 1]?.route;
}

export function usesLayoutForRoute(route: OnboardingRoute): boolean {
  const step = ONBOARDING_STEPS.find((s) => s.route === route);
  return step?.usesOnboardingLayout !== false;
}


