import React, { useState } from "react";
import { InputModal } from "./InputModal";

interface WidgetDescriptionEditorInitState {
  state: "init";
}
interface WidgetDescriptionEditorEditState {
  state: "edit";
  description: string;
}
type WidgetDescriptionEditorState =
  | WidgetDescriptionEditorInitState
  | WidgetDescriptionEditorEditState;

export function WidgetDescriptionEditor({
  description,
  setDescription,
}: {
  description: string;
  setDescription: (description: string) => void;
}) {
  const [state, setState] = useState(
    () => ({ state: "init" } as WidgetDescriptionEditorState),
  );
  return (
    <details open>
      <summary>description</summary>
      <div>
        <div>
          <button onClick={() => setState({ state: "edit", description })}>
            edit
          </button>
        </div>
        <div>
          <pre style={{ fontFamily: "serif" }}>{description}</pre>
        </div>
        {state.state === "edit" ? (
          <InputModal
            onOk={() => {
              setState({ state: "init" });
              setDescription(state.description);
            }}
            onCancel={() => {
              setState({ state: "init" });
            }}
          >
            <>
              <textarea
                onChange={(ev) =>
                  setState({ state: "edit", description: ev.target.value })
                }
              >
                {state.description}
              </textarea>
            </>
          </InputModal>
        ) : null}
      </div>
    </details>
  );
}
