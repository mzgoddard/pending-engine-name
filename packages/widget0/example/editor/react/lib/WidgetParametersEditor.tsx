import React, { useState } from "react";
import { WidgetType } from "../../../..";
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
            <td></td>
            <td>{TypeParametersAddParam(setParameters, parameters)}</td>
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
  const [newKeyName, setNewKeyName] = useState("");
  return (
    <div>
      <input
        type="text"
        value={newKeyName}
        onChange={(ev) => setNewKeyName(ev.target.value)}
      ></input>
      <button
        onClick={() =>
          setParameters({ ...parameters, [newKeyName]: { type: "any" } })
        }
      >
        add
      </button>
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
      <td>{key}</td>
      <td>
        <button onClick={() => setParameters(omitKey(parameters, key))}>
          remove
        </button>
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
