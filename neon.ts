import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Managed Better Auth (users/sessions live in the branch's neon_auth schema)
  auth: true,
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch (production): no overrides, uses project defaults
      return {};
    }
    if (branch.exists) {
      // Existing branch: no changes
      return {};
    }
    if (branch.name === "dev") {
      // Long-lived dev branch: where every migration runs before production.
      // No TTL; a small compute keeps it cheap (scale-to-zero uses the plan
      // default — the Free plan rejects a custom suspendTimeout).
      return {
        postgres: {
          computeSettings: {
            autoscalingLimitMinCu: 0.25,
            autoscalingLimitMaxCu: 1,
          },
        },
      };
    }
    // Other new branches (feature/preview): auto-expire
    // Run `neon checkout <name> --create` to create one with these settings
    return { ttl: "7d" };
  },
});
