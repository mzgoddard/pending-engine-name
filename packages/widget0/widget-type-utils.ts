import {
  WidgetArrayType,
  WidgetDictType,
  WidgetFunctionType,
  WidgetObjectType,
  WidgetTupleType,
  WidgetType,
  WidgetUnionType,
} from "./widget-type";

export function unionType(
  left: WidgetType | undefined,
  right: WidgetType | undefined,
): WidgetType {
  if (left === undefined) {
    if (right === undefined) {
      return { type: "any" };
    }
    return right;
  } else if (right === undefined) {
    return left;
  }
  if (left.type === right.type) {
    switch (left.type) {
      case "array":
        return {
          type: "array",
          items: unionType(left.items, (right as WidgetArrayType).items),
        };
      case "dict":
        return {
          type: "dict",
          values: unionType(left.values, (right as WidgetDictType).values),
        };
      case "function":
        return {
          type: "function",
          arguments: Array.from(
            {
              length: Math.max(
                left.arguments.length,
                (right as WidgetFunctionType).arguments.length,
              ),
            },
            (_, index) =>
              unionType(
                left.arguments[index],
                (right as WidgetFunctionType).arguments[index],
              ),
          ),
          return: unionType(left.return, (right as WidgetFunctionType).return),
        };
      case "object":
        return {
          type: "object",
          props: [
            ...Object.keys(left.props),
            ...Object.keys((right as WidgetObjectType).props),
          ].reduce(
            (carry, key) => ({
              ...carry,
              [key]: unionType(
                left.props[key],
                (right as WidgetObjectType).props[key],
              ),
            }),
            {},
          ),
        };
      case "tuple":
        if (left.items.length === (right as WidgetTupleType).items.length) {
          return {
            type: "tuple",
            items: Array.from({ length: left.items.length }, (_, index) =>
              unionType(
                left.items[index],
                (right as WidgetTupleType).items[index],
              ),
            ),
          };
        }
        return { type: "union", left, right };
      case "union":
        return {
          type: "union",
          left: unionType(left.left, (right as WidgetUnionType).left),
          right: unionType(left.right, (right as WidgetUnionType).right),
        };
      default:
        return left;
    }
  }
  return { type: "union", left, right };
}
