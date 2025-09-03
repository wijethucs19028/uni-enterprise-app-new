import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { makeClient } from "../api/client";

const AuthCtx = createContext(null);

export function useAuth() {
  return useContext(AuthCtx);
}

export function AuthProvider({ children }) {
  const [basic, setBasic] = useState(() => localStorage.getItem("auth.basic") || "");
  const [user, setUser] = useState(null); // { username, roles:[], studentId? }
  const [loading, setLoading] = useState(false);

  const api = useMemo(() => makeClient(() => (basic ? `Basic ${basic}` : "")), [basic]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!basic) {
        setUser(null);
        return;
      }
      setLoading(true);
      try {
        const me = await api.whoAmI();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setUser(null);
          setBasic("");
          localStorage.removeItem("auth.basic");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [basic, api]);

  async function signIn(username, password) {
    const token = btoa(`${username}:${password}`);
    const tempApi = makeClient(() => `Basic ${token}`);
    const me = await tempApi.whoAmI();       // throws on 401/403
    setBasic(token);
    localStorage.setItem("auth.basic", token);
    setUser(me);
    return me;
  }

  function signOut() {
    setBasic("");
    localStorage.removeItem("auth.basic");
    setUser(null);
  }

  function is(role) { return !!user?.roles?.includes(role); }
  function hasAny(roles = []) { return roles.some(r => user?.roles?.includes(r)); }

  return (
    <AuthCtx.Provider value={{ api, user, loading, signIn, signOut, is, hasAny }}>
      {children}
    </AuthCtx.Provider>
  );
}

/* -------- Light provider for Admin area (no in-app login) -------- */
export function AuthProviderNoHeader({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useMemo(() => makeClient(() => ""), []); 

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.whoAmI(); 
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api]);


  const signOut = () => {};

  const is = (role) => !!user?.roles?.includes(role);
  const hasAny = (roles=[]) => roles.some(r => user?.roles?.includes(r));

  return (
    <AuthCtx.Provider value={{ api, user, loading, signIn: async()=>{}, signOut, is, hasAny }}>
      {children}
    </AuthCtx.Provider>
  );
}
