import { afterEach, describe, expect, it } from "vitest";
import {
  isDemoAdminAllowed,
  isDemoDataAllowed,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "./env";

const originalNodeEnv = process.env.NODE_ENV;
const originalDemoAdmin = process.env.ALLOW_DEMO_ADMIN;
const originalDemoData = process.env.ALLOW_DEMO_DATA;
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function setEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  setEnv("NODE_ENV", originalNodeEnv);
  setEnv("ALLOW_DEMO_ADMIN", originalDemoAdmin);
  setEnv("ALLOW_DEMO_DATA", originalDemoData);
  setEnv("NEXT_PUBLIC_SUPABASE_URL", originalSupabaseUrl);
  setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", originalAnonKey);
  setEnv("SUPABASE_SERVICE_ROLE_KEY", originalServiceRoleKey);
});

describe("runtime environment guards", () => {
  it("never allows demo admin access in production", () => {
    setEnv("NODE_ENV", "production");
    setEnv("ALLOW_DEMO_ADMIN", "true");

    expect(isDemoAdminAllowed()).toBe(false);
  });

  it("allows demo admin access only when explicitly enabled outside production", () => {
    setEnv("NODE_ENV", "development");
    setEnv("ALLOW_DEMO_ADMIN", "true");

    expect(isDemoAdminAllowed()).toBe(true);
  });

  it("never allows demo catalog data in production", () => {
    setEnv("NODE_ENV", "production");
    setEnv("ALLOW_DEMO_DATA", "true");

    expect(isDemoDataAllowed()).toBe(false);
  });

  it("allows the demo catalog in local development by default", () => {
    setEnv("NODE_ENV", "development");
    setEnv("ALLOW_DEMO_DATA", undefined);

    expect(isDemoDataAllowed()).toBe(true);
  });

  it("requires both public and service-role Supabase credentials for admin access", () => {
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "a".repeat(32));
    setEnv("SUPABASE_SERVICE_ROLE_KEY", "b".repeat(32));

    expect(isSupabaseConfigured()).toBe(true);
    expect(isSupabaseAdminConfigured()).toBe(true);

    setEnv("SUPABASE_SERVICE_ROLE_KEY", "your_service_role_key");
    expect(isSupabaseAdminConfigured()).toBe(false);
  });
});
