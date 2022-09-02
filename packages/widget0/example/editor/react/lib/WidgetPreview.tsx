import React from "react";
import { WidgetData, WidgetFoundationClass, WidgetValue } from "../../../..";
import { buildWidgetEvaluator } from "../../../../level0";
import { useDatabase } from "../../database";

export const WidgetPreview = ({
  def,
  params,
}: {
  def: WidgetData;
  params: { [key: string]: WidgetValue };
}) => {
  const database = useDatabase();
  const evalWidget = buildWidgetEvaluator({
    ref(value, params) {
      const def = database.get(value.id);
      if (def && "body" in def) {
        return (
          <WidgetPreview
            def={def}
            params={evalWidget.shape({ shape: value.parameters }, params)}
          />
        );
      } else if (def) {
        return (def as WidgetFoundationClass<any, any>).create(params);
      }
      throw new Error();
    },
  });
  return evalWidget.value(def.body, params);
};
