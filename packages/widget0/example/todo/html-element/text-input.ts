import { WidgetTagArray } from "../../..";

export default [
  ["text-input"] as WidgetTagArray,
  {
    create(params: { value; change }) {
      const input = document.createElement("input");
      input.type = "text";
      if (params.value) {
        input.value = params.value;
      }
      if (params.change) {
        input.onchange = ({ target }: Event) =>
          params.change((target as HTMLInputElement)?.value);
      }
      return input;
    },
  },
] as const;
