import { WidgetData, WidgetTagArray } from "../../..";
import { WidgetDatabaseMap } from "../../../level0";

import componentAddTodo from "./add-todo.json";
import { componentRoot } from "./root";
import { componentTodo } from "./todo";

export const components = new WidgetDatabaseMap(
  new Map([
    componentAddTodo as [WidgetTagArray, WidgetData],
    componentRoot,
    componentTodo,
  ])
);
