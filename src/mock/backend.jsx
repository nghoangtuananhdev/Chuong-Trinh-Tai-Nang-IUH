import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildSeedDb } from "./seed/index.js";
import {
  DB_KEY,
  SESSION_KEY,
  loadDb,
  loadSession,
  saveDb,
  saveSession,
} from "./persistence.js";
import { buildCtx } from "./services/_kernel.js";
import { createMockClient } from "./client.js";
import { tick } from "../domain/scheduler.js";
import { can as domainCan, isRoleEffective } from "../domain/permissions.js";
import { clearEvidence } from "./evidence-store.js";
import { useToast } from "../components/ui/ToastProvider.jsx";
const BackendContext = createContext(null);
export function MockBackendProvider({
  children,
  latencyMs = [150, 300],
  initialState,
}) {
  const { showToast } = useToast();
  const [state, setState] = useState(() => {
    if (initialState) return initialState;
    const db = loadDb(buildSeedDb);
    return { db: tick(db, db.clock.now).db, session: loadSession() };
  });
  const client = useRef(null);
  if (!client.current)
    client.current = createMockClient({
      initialState: state,
      onState: setState,
      entropy: () => crypto.randomUUID(),
      seedFactory: buildSeedDb,
      clearFiles: clearEvidence,
      delay: () =>
        new Promise((resolve) =>
          setTimeout(
            resolve,
            latencyMs[0] + Math.random() * (latencyMs[1] - latencyMs[0]),
          ),
        ),
      persist: (next, previous) => {
        try {
          saveDb(next.db);
          saveSession(next.session);
        } catch (error) {
          // If the second key fails, keep the previously committed db/session together.
          try {
            saveDb(previous.db);
            saveSession(previous.session);
          } catch {
            /* Original error remains actionable. */
          }
          throw error;
        }
      },
    });
  useEffect(() => {
    try {
      saveDb(client.current.getState().db);
    } catch (error) {
      showToast(error.message, "error");
    }
    const synchronize = (event) => {
      if (![DB_KEY, SESSION_KEY].includes(event.key)) return;
      client.current.replaceState({
        db: loadDb(buildSeedDb),
        session: loadSession(),
      });
    };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, [showToast]);
  const value = useMemo(() => {
    const ctx = buildCtx(state.db, state.session);
    return {
      ...state,
      me: ctx.actor?.user ?? null,
      activeRole: ctx.actor?.roleAssignment ?? null,
      roles: state.db.userRoles.filter(
        (r) =>
          r.userId === ctx.actor?.user.id &&
          isRoleEffective(r, state.db.clock.now),
      ),
      now: state.db.clock.now,
      call: client.current.call,
      can: (permission, resource) => domainCan(ctx, permission, resource),
    };
  }, [state]);
  return (
    <BackendContext.Provider value={value}>{children}</BackendContext.Provider>
  );
}
export const useBackend = () => useContext(BackendContext);
