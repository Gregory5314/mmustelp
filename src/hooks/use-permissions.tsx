import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

type Ctx = {
  permissions: Set<string>;
  roles: string[];
  isLoading: boolean;
  has: (perm: string) => boolean;
  hasAny: (perms: string[]) => boolean;
  refresh: () => Promise<void>;
};

const PermCtx = createContext<Ctx | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    if (!user) { setPermissions(new Set()); setRoles([]); setIsLoading(false); return; }
    setIsLoading(true);
    const [{ data: perms }, { data: rs }] = await Promise.all([
      supabase.rpc("get_my_permissions"),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    setPermissions(new Set(((perms ?? []) as string[])));
    setRoles(((rs ?? []) as { role: string }[]).map((r) => r.role));
    setIsLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  return (
    <PermCtx.Provider value={{
      permissions, roles, isLoading,
      has: (p) => permissions.has(p),
      hasAny: (ps) => ps.some((p) => permissions.has(p)),
      refresh: load,
    }}>
      {children}
    </PermCtx.Provider>
  );
}

export function usePermissions() {
  const c = useContext(PermCtx);
  if (!c) throw new Error("usePermissions must be used within PermissionsProvider");
  return c;
}
