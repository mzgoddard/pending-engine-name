import PropTypes from "prop-types";
import { unionType } from "./fit-type";
import {
  WidgetType,
  WidgetTypeParameters,
  WidgetUnionType,
} from "./widget-type";

// export function asWidgetType(type: PropTypes.Validator<any>): WidgetType {}

function optionsOf(type: WidgetUnionType): WidgetType[] {
  const left = type.left.type === "union" ? optionsOf(type.left) : [type.left];
  const right =
    type.right.type === "union" ? optionsOf(type.right) : [type.right];
  return [...left, ...right];
}

export function asValidator(type: WidgetType): PropTypes.Validator<any> {
  switch (type.type) {
    case "any":
      return PropTypes.any;
    case "array":
      return PropTypes.arrayOf(asValidator(type.items));
    case "boolean":
      return PropTypes.bool;
    case "closure":
      throw new Error();
    case "dict":
      return PropTypes.objectOf(asValidator(type.values));
    case "function":
      return PropTypes.func;
    case "number":
      return PropTypes.number;
    case "object":
      return PropTypes.shape(asValidationMap(type.props));
    case "primitive":
      return PropTypes.oneOf([
        PropTypes.bool,
        PropTypes.number,
        PropTypes.string,
      ]);
    case "string":
      return PropTypes.string;
    case "symbol":
      throw new Error();
    case "tuple":
      return PropTypes.arrayOf(
        asValidator(
          type.items.length === 0
            ? { type: "void" }
            : type.items.length === 1
            ? type.items[0]
            : type.items.reduce(unionType),
        ),
      );
    case "union":
      return PropTypes.oneOf(optionsOf(type));
    case "void":
      throw new Error();
    default:
      throw new Error();
  }
}

export function asValidationMap(
  props: WidgetTypeParameters,
): PropTypes.ValidationMap<any> {
  return Object.entries(props).reduce(
    (carry, [key, prop]) =>
      ({ ...carry, [key]: prop } as PropTypes.ValidationMap<any>),
    {},
  );
}

// PropTypes.string;
