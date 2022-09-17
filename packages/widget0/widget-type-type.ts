import { WidgetType, WidgetTypeParameters } from "./widget-type";
import wtFactory from "./widget-type-factory";

const {
  arrayOf,
  dictOf,
  enumOf,
  literal,
  objectOf,
  optional,
  rootPath,
  string,
  unionOf,
} = wtFactory;

function unwrapRootType(
  type: WidgetType,
  root: WidgetTypeParameters,
): WidgetType {
  return walkType(type, (type, recurse) => {
    switch (type.type) {
      case "root":
        return root[type.parameter];
      case "path":
        const targetType = recurse(type.target);
        switch (targetType.type) {
          case "dict":
            return targetType.values;
          case "object":
            if (type.path in targetType.props) {
              return targetType.props[type.path];
            }
            throw new Error();
          default:
            throw new Error();
        }
      default:
        return recurse(type);
    }
  });
}

function unwrapRoot(root: WidgetTypeParameters): WidgetTypeParameters {
  return Object.entries(root).reduce(
    (carry, [key, value]) => ({ ...carry, [key]: unwrapRootType(value, root) }),
    {},
  );
}

function walkType(
  type: WidgetType,
  cb: (
    type: WidgetType,
    recurse: (type: WidgetType) => WidgetType,
  ) => WidgetType | undefined,
) {
  const recurse = (type: WidgetType) => {
    switch (type.type) {
      case "any":
        return type;
      case "array": {
        const items = cb(type.items, recurse);
        return items ? { ...type, items } : type;
      }
      case "boolean":
        return type;
      case "closure":
        return type;
      case "dict": {
        const values = cb(type.values, recurse);
        return values ? { ...type, values } : type;
      }
      case "function":
        return {
          ...type,
          arguments: type.arguments.map((arg) => cb(arg, recurse) ?? arg),
          return: cb(type.return, recurse) ?? type.return,
        };
      case "id":
        return type;
      case "literal":
        return type;
      case "number":
        return type;
      case "object":
        return {
          ...type,
          props: Object.entries(type.props).reduce(
            (carry, [key, value]) => ({
              ...carry,
              [key]: cb(value, recurse) ?? value,
            }),
            {},
          ),
        };
      case "path":
        return type;
      case "primitive":
        return type;
      case "root":
        return type;
      case "string":
        return type;
      case "symbol":
        return type;
      case "tuple":
        return {
          ...type,
          items: type.items.map((item) => cb(item, recurse) ?? item),
        };
      case "union":
        return {
          ...type,
          left: cb(type.left, recurse) ?? type.left,
          right: cb(type.right, recurse) ?? type.right,
        };
      case "void":
        return type;
      default:
        throw new Error();
    }
  };
  return cb(type, recurse) ?? type;
}

export const wrappedTypes = {
  Primitive: objectOf({
    type: enumOf("boolean", "number", "string", "primitive"),
    comment: optional(string),
  }),
  Literal: objectOf({
    type: literal("literal"),
    literal: rootPath("Primitive"),
    comment: optional(string),
  }),
  Array: objectOf({
    type: literal("array"),
    items: rootPath("Type"),
    comment: optional(string),
  }),
  Tuple: objectOf({
    type: literal("array"),
    items: arrayOf(rootPath("Type")),
    comment: optional(string),
  }),
  Dict: objectOf({
    type: literal("dict"),
    values: rootPath("Type"),
    comment: optional(string),
  }),
  Object: objectOf({
    type: literal("object"),
    props: dictOf(rootPath("Type")),
    comment: optional(string),
  }),
  Type: unionOf([rootPath("Primitive"), rootPath("Literal")]),
};

export const types = unwrapRoot(wrappedTypes);
