import React, { createContext, useContext, useEffect, useMemo } from "react";
import { BehaviorSubject, Observable } from "rxjs";
import { ErrorBoundary } from "./ErrorBoundary";
import { useObservable } from "./useObservable";

interface Modal {
  onOk?: () => void;
  onCancel?: () => void;
  body: React.ReactElement;
}

export const InputModalHostContext = createContext({
  newModalController() {
    return { update(modal: Modal) {}, destroy() {} };
  },
});

export function useInputModal(modal: Modal) {
  const host = useContext(InputModalHostContext);
  const modalController = useMemo(() => host.newModalController(), []);
  useEffect(() => {
    modalController.update(modal);
    return () => modalController.destroy();
  });
}

const InputModalOutlet = ({ modals$ }: { modals$: Observable<Modal[]> }) => {
  const modals = useObservable(modals$, () => []);
  console.log(modals);
  const lastModal = modals[modals.length - 1];
  if (lastModal) {
    return (
      <div style={{ position: "fixed", top: 0, height: "100%", width: "100%" }}>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.2)",
            height: "100%",
            width: "100%",
          }}
          onClick={lastModal.onCancel}
        >
          <div
            style={{ background: "white" }}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              return false;
            }}
          >
            <div>
              {lastModal.onOk ? (
                <button onClick={lastModal.onOk}>ok</button>
              ) : null}
              {lastModal.onCancel ? (
                <button onClick={lastModal.onCancel}>cancel</button>
              ) : null}
            </div>
            <div>
              <ErrorBoundary>{lastModal.body}</ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <></>;
};

export const InputModalHost = ({ children }: { children: React.ReactNode }) => {
  const modalContext = useMemo(
    () => ({
      modals$: new BehaviorSubject([]),
      newModalController() {
        const { modals$ } = this;
        let lastModal;
        return {
          update(modal) {
            console.log("update", modal);
            const currentModals = modals$.value;
            const index = currentModals.indexOf(lastModal);
            lastModal = modal;
            if (index === -1) {
              modals$.next([...currentModals, modal]);
            } else {
              modals$.next([
                ...currentModals.slice(0, index),
                modal,
                ...currentModals.slice(index + 1),
              ]);
            }
          },
          destroy() {
            console.log("destroy");
            const currentModals = modals$.value;
            const index = currentModals.indexOf(lastModal);
            if (index > -1) {
              modals$.next([
                ...currentModals.slice(0, index),
                ...currentModals.slice(index + 1),
              ]);
            }
          },
        };
      },
    }),
    [],
  );
  return (
    <InputModalHostContext.Provider value={modalContext}>
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <div style={{ height: "100%", width: "100%" }}>{children}</div>
        <InputModalOutlet modals$={modalContext.modals$} />
      </div>
    </InputModalHostContext.Provider>
  );
};
