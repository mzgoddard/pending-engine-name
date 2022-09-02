import React from "react";
import { WidgetData, WidgetDataDefinition } from "../../../..";
import { WidgetDefinition } from "../../../../widget-data";
import { InputModalHost } from "./InputModalHost";
import { WidgetBodyEditor } from "./WidgetBodyEditor";
import { WidgetDescriptionEditor } from "./WidgetDescriptionEditor";
import { WidgetParametersEditor } from "./WidgetParametersEditor";
import { WidgetTagsEditor } from "./WidgetTagsEditor";

export const WidgetEditor = ({
  data,
  setData,
}: {
  data: WidgetDataDefinition;
  setData: (data: WidgetDataDefinition) => void;
}) => {
  return (
    <>
      <div>id: {data.id}</div>
      <WidgetTagsEditor
        tags={data.tags}
        setTags={(tags) => setData({ ...data, tags })}
      ></WidgetTagsEditor>
      <WidgetDescriptionEditor
        description={data.description}
        setDescription={(description) => setData({ ...data, description })}
      />
      <WidgetParametersEditor
        parameters={data.parameters}
        setParameters={(parameters) => setData({ ...data, parameters })}
      ></WidgetParametersEditor>
      <WidgetBodyEditor
        parameters={data.parameters}
        body={data.body}
        setBody={(body) => setData({ ...data, body })}
      ></WidgetBodyEditor>
    </>
  );
};
