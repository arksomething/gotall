import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import { logEvent } from "./Analytics";
import { crashlytics } from "./crashlytics";

type VariantDefinition = {
  name: string;
  weight: number; // relative weight, not necessarily summing to 100
};

type ExperimentDefinition = {
  id: string;
  variants: VariantDefinition[];
  enabled?: boolean;
};

// Central registry for experiments. Add new experiments here.
export const EXPERIMENTS: Record<string, ExperimentDefinition> = {
  onboarding_cta_copy: {
    id: "onboarding_cta_copy",
    variants: [
      { name: "control_lets_start", weight: 1 },
      { name: "variant_get_started", weight: 1 },
    ],
    enabled: true,
  },
};

const USER_BUCKET_ID_KEY = "@exp_user_bucket_id";

async function getOrCreateUserBucketId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(USER_BUCKET_ID_KEY);
    if (existing) return existing;
    // Generate a simple random identifier and persist it (sufficient for bucketing)
    const newId = `${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    await AsyncStorage.setItem(USER_BUCKET_ID_KEY, newId);
    return newId;
  } catch {
    // Fallback to an ephemeral ID (non-persistent)
    return `${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}

// Lightweight deterministic hash (djb2)
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0; // ensure unsigned 32-bit
}

function assignVariantForHash(
  hashedValue: number,
  definition: ExperimentDefinition
): string {
  const enabled = definition.enabled !== false;
  if (!enabled) return definition.variants[0]?.name ?? "control";

  const totalWeight = definition.variants.reduce(
    (sum, v) => sum + Math.max(0, v.weight),
    0
  );
  if (totalWeight <= 0) return definition.variants[0]?.name ?? "control";

  const bucket = hashedValue % totalWeight;
  let cumulative = 0;
  for (const variant of definition.variants) {
    cumulative += Math.max(0, variant.weight);
    if (bucket < cumulative) return variant.name;
  }
  return definition.variants[0]?.name ?? "control";
}

async function computeAssignment(
  experimentId: string
): Promise<{ userId: string; variant: string } | null> {
  const def = EXPERIMENTS[experimentId];
  if (!def) return null;
  const userId = await getOrCreateUserBucketId();
  const hashed = hashString(`${experimentId}:${userId}`);
  const variant = assignVariantForHash(hashed, def);
  return { userId, variant };
}

export function useExperiment(
  experimentId: string,
  options?: { logExposureOnMount?: boolean; attributes?: Record<string, any> }
) {
  const [variant, setVariant] = useState<string>("control");
  const [isReady, setIsReady] = useState(false);
  const exposureLoggedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    computeAssignment(experimentId).then((res) => {
      if (!isMounted || !res) return;
      setVariant(res.variant);
      setIsReady(true);

      // Set crashlytics attribute for easier debugging/segmentation
      try {
        crashlytics.setCustomKey(`ab_${experimentId}`, res.variant);
      } catch {}

      if (options?.logExposureOnMount && !exposureLoggedRef.current) {
        exposureLoggedRef.current = true;
        try {
          logEvent("exp_exposure", {
            experiment_id: experimentId,
            variant: res.variant,
            ...options.attributes,
          });
        } catch {}
      }
    });
    return () => {
      isMounted = false;
    };
  }, [experimentId]);

  const trackConversion = useMemo(
    () =>
      (eventName: string, params?: Record<string, any>) => {
        try {
          logEvent(eventName, {
            experiment_id: experimentId,
            variant,
            ...params,
          });
        } catch {}
      },
    [experimentId, variant]
  );

  return { variant, isReady, trackConversion } as const;
}


