import { HtmlElementBuilder } from "../../../level2-html-element";
import { WidgetFoundationMap } from "../../../level0";

import { components } from "../components";

import addTodoController from "./add-todo-controller";
import button from "./button";
import container from "./container";
import rootController from "./root-controller";
import text from "./text";
import textInput from "./text-input";
import todoController from "./todo-controller";

// export {
//   addTodoController,
//   button,
//   container,
//   rootController,
//   textInput,
//   todoController,
// };

export const htmlElementFoundation = new WidgetFoundationMap(
  new Map([
    addTodoController,
    button,
    container,
    rootController,
    text,
    textInput,
    todoController,
  ])
);

export function htmlElementWidgets() {
  return new HtmlElementBuilder(htmlElementFoundation, components);
}
