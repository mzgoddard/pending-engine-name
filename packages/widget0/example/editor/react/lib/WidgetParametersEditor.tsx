import React, { useState } from "react";
import { WidgetType } from "../../../..";
import { InputModal } from "./InputModal";
import { OrderButtonBar } from "./OrderButtonBar";
import { State, StateContext, StateMachine } from "./StateMachine";
import { TypeSlot } from "./TypeSlot";

type SetWidgetParameters = (parameters: { [key: string]: WidgetType }) => void;

type WidgetParameters = {
  [key: string]: WidgetType;
};

export const WidgetParametersEditor = ({
  parameters,
  setParameters,
}: {
  parameters: WidgetParameters;
  setParameters: SetWidgetParameters;
}) => {
  return TypeParameters(parameters, setParameters);
};

function TypeParameters(
  parameters: WidgetParameters,
  setParameters: SetWidgetParameters,
) {
  return (
    <details open>
      <summary>parameters</summary>
      <div>
        <table>
          {Object.entries(parameters).map(([key, item], index) =>
            TypeParametersRow(parameters, setParameters, index, key, item),
          )}
          <tr>
            <td>{TypeParametersAddParam(setParameters, parameters)}</td>
            <td></td>
          </tr>
        </table>
      </div>
    </details>
  );
}

function TypeParametersAddParam(
  setParameters: SetWidgetParameters,
  parameters: WidgetParameters,
) {
  return (
    <div>
      <StateMachine defaultState={() => ({ state: "init" })}>
        <StateContext.Consumer>
          {({ setState }) => (
            <button onClick={() => setState({ state: "add", newKeyName: "" })}>
              add
            </button>
          )}
        </StateContext.Consumer>
        <State on={{ state: "add" }}>
          <StateContext.Consumer>
            {({ state: { newKeyName }, setState, assignState }) => (
              <InputModal
                onOk={() => {
                  setState({ state: "init" });
                  setParameters({
                    ...parameters,
                    [newKeyName]: { type: "any" },
                  });
                }}
                onCancel={() => setState({ state: "init" })}
              >
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(ev) =>
                    assignState({ newKeyName: ev.target.value })
                  }
                ></input>
              </InputModal>
            )}
          </StateContext.Consumer>
        </State>
      </StateMachine>
    </div>
  );
}

function TypeParametersRow(
  parameters: WidgetParameters,
  setParameters: SetWidgetParameters,
  index: number,
  key: string,
  item: WidgetType,
): JSX.Element {
  return (
    <tr>
      <td valign="top">
        <OrderButtonBar.Props
          container={parameters}
          setContainer={setParameters}
          index={index}
          length={Object.keys(parameters).length}
        />{" "}
        {key}
      </td>
      <td>
        <TypeSlot
          type={item}
          setType={(indexType) =>
            setParameters({ ...parameters, [key]: indexType })
          }
        ></TypeSlot>
      </td>
    </tr>
  );
}

function omitKey(
  parameters: WidgetParameters,
  key: string,
): { [key: string]: WidgetType } {
  return Object.entries(parameters).reduce(
    (carry, [eachKey, value]) =>
      key === eachKey ? carry : { ...carry, [eachKey]: value },
    {},
  );
}
