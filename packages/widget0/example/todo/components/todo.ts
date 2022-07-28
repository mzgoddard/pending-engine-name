import { WidgetData, WidgetTagArray } from "../../..";

export const componentTodo = [
  ["todo"] as WidgetTagArray,
  {
    parameters: {
      todo: { type: "object", props: { description: { type: "string" } } },
    },
    body: {
      tags: ["container"],
      parameters: {
        children: {
          items: [
            {
              tags: ["text"],
              parameters: {
                children: {
                  items: [
                    { target: { parameter: "todo" }, property: "description" },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  } as WidgetData,
] as const;
