import { HtmlStringBuilder } from "../../level2-html-string";
import {
  WidgetDatabaseMap,
  WidgetFoundationGroup,
  WidgetFoundationMap,
} from "../../level0";
import { componentRoot } from "./components/root";
import { htmlElementWidgets } from "./html-element";
import { foundationText } from "./html-string/text";

main();

async function main() {
  const rootWidget = await htmlElementWidgets().build({
    parameters: {},
    body: { tags: ["root"], parameters: { name: { direct: "world" } } },
  });
  const rootElement = document.querySelector("#root");
  if (rootElement === null) {
    throw new Error();
  }
  const rootRender = rootWidget.create({});
  if (rootRender instanceof HTMLElement) {
    rootElement.appendChild(rootRender);
  } else {
    rootElement.innerHTML = rootRender;
  }
}

function widgets(): HtmlStringBuilder {
  return new HtmlStringBuilder(
    new WidgetFoundationMap(new Map([foundationText])),
    new WidgetDatabaseMap(new Map([componentRoot]))
  );
}
