import React from "react";
import { WidgetDefinition } from "../../../../widget-data";

export function widgetName(def: WidgetDefinition): React.ReactNode {
  if (def.description && def.description.length > 0) {
    return def.description.slice(0, def.description.indexOf("\n"));
  }
  return def.id;
}
