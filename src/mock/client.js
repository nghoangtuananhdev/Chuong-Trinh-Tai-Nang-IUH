import { services } from "./service-registry.js";
import { buildCtx } from "./services/_kernel.js";
import { tick } from "../domain/scheduler.js";
import { DomainError } from "../domain/errors.js";

// Serializes calls against the latest committed db. Browser I/O is injected by the provider.
export function createMockClient({
  initialState,
  persist,
  onState,
  entropy,
  seedFactory,
  clearFiles,
  delay = async () => {},
}) {
  let state = initialState;
  let pending = Promise.resolve();
  const replaceState = (next) => {
    state = next;
    onState(next);
  };
  const call = (name, payload = {}) => {
    const task = pending
      .catch(() => {})
      .then(async () => {
        await delay();
        const fn = typeof name === "function" ? name : services[name];
        if (!fn)
          throw new DomainError(
            "NOT_FOUND",
            "Chức năng chưa được triển khai ở giai đoạn hiện tại.",
          );
        const ctx = {
          ...buildCtx(state.db, state.session, entropy()),
          seedDb: fn.serviceName === "system.resetDemo" ? seedFactory() : null,
        };
        const outcome = fn(state.db, ctx, payload);
        if (fn.readOnly) return outcome.result;
        const next = {
          db: tick(outcome.db, outcome.db.clock.now).db,
          session:
            outcome.effects?.session === undefined
              ? state.session
              : outcome.effects.session,
        };
        await persist(next, state);
        replaceState(next);
        if (outcome.effects?.clearEvidence) await clearFiles();
        if (outcome.error) throw outcome.error;
        return outcome.result;
      });
    pending = task;
    return task;
  };
  return { call, replaceState, getState: () => state };
}
