import React, { createContext } from "react";
import { useState } from "react";

export const StateContext = createContext({
  state: null as any,
  setState(newState: any) {},
  assignState(newState: any) {},
  reset() {},
});

export function matchState(expect: any, actual: any) {
  for (const key in expect) {
    if (expect[key] !== actual[key]) {
      return false;
    }
  }
  return true;
}

export const State = ({
  on,
  children,
}: {
  on: ((state: any) => boolean) | { [key: string]: string | number | boolean };
  children: React.ReactNode;
}) => {
  if (typeof on === "object") {
    on = matchState.bind(null, on);
  }
  return (
    <StateContext.Consumer>
      {({ state }) => (on(state) ? children : <></>)}
    </StateContext.Consumer>
  );
};

export const StateMachine = ({
  children,
  defaultState,
}: {
  children: React.ReactNode;
  defaultState: () => any;
}) => {
  const [state, setState] = useState(defaultState);
  return (
    <StateContext.Provider
      value={{
        state,
        setState,
        assignState: (newState) => setState({ ...state, ...newState }),
        reset: () => setState(defaultState()),
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
