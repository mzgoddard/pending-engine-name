import { WidgetDatabaseMap } from "../../../level0";

import editorSlot from "./editor-slot.json";

export function components() {
  return new WidgetDatabaseMap(
    new Map(
      ([editorSlot] as any[]).map(({ tags, parameters, body }) => [
        tags,
        { parameters, body },
      ])
    )
  );
}
