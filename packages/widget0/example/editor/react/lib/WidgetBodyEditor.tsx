import React from "react";
import { WidgetTypeParameters } from "../../../../widget-data";
import { WidgetValue } from "../../../../widget-value";
import { ValueSlot } from "./ValueSlot";

export const WidgetBodyEditor = ({
  parameters,
  body,
  setBody,
}: {
  parameters: WidgetTypeParameters;
  body: WidgetValue;
  setBody: (body: WidgetValue) => void;
}) => {
  return (
    <>
      <div>body:</div>
      <ValueSlot
        parameters={parameters}
        type={{ type: "any" }}
        value={body}
        setValue={setBody}
      />
    </>
  );
};
