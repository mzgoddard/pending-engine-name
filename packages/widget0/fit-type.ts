import {
  WidgetArrayType,
  WidgetType,
  WidgetTypeParameters,
  WidgetValue,
} from ".";
import {
  isWidgetComparison,
  isWidgetCompute,
  isWidgetCondition,
  // isWidgetDefer,
  isWidgetDirect,
  isWidgetMap,
  isWidgetMember,
  isWidgetObject,
  isWidgetParameter,
  isWidgetProperty,
  isWidgetRef,
  isWidgetTuple,
} from "./level0";
import {
  WidgetDictType,
  WidgetFunctionType,
  WidgetObjectType,
  WidgetTupleType,
  WidgetUnionType,
} from "./widget-type";
import { unionType } from "./widget-type-utils";

export function evalValueType(
  value: WidgetValue,
  parameters: { [key: string]: WidgetType },
  callArguments: WidgetType[] = [],
): WidgetType {
  if (isWidgetDirect(value)) {
    const typeofDirect = typeof value.direct;
    switch (typeofDirect) {
      case "boolean":
      case "number":
      case "string":
      case "symbol":
        return { type: typeofDirect };
      default:
        throw new Error();
    }
  } else if (isWidgetParameter(value)) {
    return parameters[value.parameter];
  } else if (isWidgetProperty(value)) {
    const targetType = evalValueType(value.target, parameters);
    return pickTypeProperty(targetType, value.property);
  } else if (isWidgetMember(value)) {
    const targetType = evalValueType(value.target, parameters);
    const memberType = evalValueType(value.member, parameters);
    switch (targetType.type) {
      case "array":
        switch (memberType.type) {
          case "any":
          case "number":
            return targetType.items;
          default:
            throw new Error();
        }
      case "tuple":
        switch (memberType.type) {
          case "any":
          case "number":
            if (targetType.items.length === 0) {
              return { type: "any" };
            }
            return targetType.items
              .slice(1)
              .reduceRight(
                (right, item) => ({ type: "union", left: item, right }),
                targetType.items[0],
              );
          default:
            throw new Error();
        }
      case "dict":
        switch (memberType.type) {
          case "any":
          case "string":
            return targetType.values;
          default:
            throw new Error();
        }
      case "object":
        switch (memberType.type) {
          case "any":
          case "string":
            const props = Object.values(targetType.props);
            if (props.length === 0) {
              return { type: "any" };
            }
            return props
              .slice(1)
              .reduceRight(
                (right, item) => ({ type: "union", left: item, right }),
                props[0],
              );
          default:
            throw new Error();
        }
      default:
        throw new Error();
    }
  } else if (isWidgetTuple(value)) {
    return {
      type: "tuple",
      items: value.items.map((item) => evalValueType(item, parameters)),
    };
  } else if (isWidgetObject(value)) {
    return {
      type: "object",
      props: Object.entries(value.shape).reduce((carry, [key, value]) => {
        carry[key] = evalValueType(value, parameters);
        return carry;
      }, {}),
    };
  } else if (isWidgetComparison(value)) {
    return { type: "boolean" };
  } else if (isWidgetCondition(value)) {
    return unionType(
      evalValueType(value.ifTrue, parameters),
      evalValueType(value.ifFalse, parameters),
    );
  } else if (isWidgetMap(value)) {
    const targetType = evalValueType(value.target, parameters);
    switch (targetType.type) {
      case "any":
      case "array":
        return {
          type: "array",
          items: evalValueType(value.map, parameters, [targetType]),
        };
      case "tuple":
        return {
          type: "tuple",
          items: targetType.items.map((item) =>
            evalValueType(value.map, parameters, [item]),
          ),
        };
      default:
        throw new Error();
    }
  } else if (isWidgetCompute(value)) {
    const typeArguments = value.arguments.map(
      (_, index) => callArguments[index] ?? { type: "any" },
    );
    return {
      type: "function",
      arguments: typeArguments,
      return: evalValueType(
        value.compute,
        value.arguments.reduce(
          (carry, key, index) => ({ ...carry, [key]: typeArguments[index] }),
          parameters,
        ),
      ),
    };
  } else if (isWidgetRef(value)) {
    return { type: "any" };
  }
  throw new Error();
}

function pickTypeProperty(type: WidgetType, property: string): WidgetType {
  switch (type.type) {
    case "object":
      if (property in type.props) {
        return type.props[property];
      }
      throw new Error();
    case "any":
      return type;
    case "array":
    case "tuple":
      return pickTypeProperty(
        {
          type: "object",
          props: { length: { type: "number" } },
        },
        property,
      );
    case "union":
      return {
        type: "union",
        left: pickTypeProperty(type.left, property),
        right: pickTypeProperty(type.right, property),
      };
    case "boolean":
    case "number":
    case "string":
    case "symbol":
      throw new Error();
    case "function":
      throw new Error();
    case "void":
      throw new Error();
    default:
      throw new Error();
  }
}

// export function fulfillType(expect: WidgetType, actual: WidgetType) {
//   if (expect.type === "any" || actual.type === "any") {
//     return true;
//   } else if (actual.type === "union") {
//     return fulfillType(expect, actual.left) & fulfillType(expect, actual.right);
//   }
//   switch (expect.type) {
//     case "boolean":
//     case "number":
//     case "string":
//     case "symbol":
//       return actual.type === "primitive" || actual.type === expect.type;
//     case "primitive":
//       return (
//         actual.type === "primitive" ||
//         actual.type === "boolean" ||
//         actual.type === "number" ||
//         actual.type === "string" ||
//         actual.type === "symbol"
//       );
//     case "void":
//       return actual.type === expect.type;
//     case "array":
//       switch (actual.type) {
//         case "array":
//           return fulfillType(expect.items, actual.items);
//         case "tuple":
//           return actual.items.every((item) => fulfillType(expect.items, item));
//         default:
//           return false;
//       }
//     case "tuple":
//       if (actual.type === "tuple") {
//         return (
//           expect.items.length === actual.items.length &&
//           expect.items.every((item, index) =>
//             fulfillType(item, actual.items[index]),
//           )
//         );
//       }
//       return false;
//     case "object":
//       if (actual.type === "object") {
//       }
//       return false;
//     case "function":
//       if (actual.type == "function") {
//         return (
//           expect.arguments.length === actual.arguments.length &&
//           expect.arguments.every((item, index) =>
//             fulfillType(item, actual.arguments[index]),
//           ) &&
//           fulfillType(expect.return, actual.return)
//         );
//       }
//       return false;
//     case "union":
//       return (
//         fulfillType(expect.left, actual) | fulfillType(expect.right, actual)
//       );
//     default:
//       throw new Error();
//   }
// }

export function typeDefault(type: WidgetType): WidgetValue {
  switch (type.type) {
    case "any":
      return { direct: "" };
    case "array":
      return { items: [] };
    case "boolean":
      return { direct: false };
    case "dict":
      return { shape: {} };
    case "function":
      return { arguments: [], compute: typeDefault(type.return) };
    case "number":
      return { direct: 0 };
    case "object":
      return {
        shape: Object.entries(type.props).reduce(
          (carry, [key, value]) => ({ ...carry, [key]: value }),
          {},
        ),
      };
    case "primitive":
      return { direct: "" };
    case "string":
      return { direct: "" };
    case "symbol":
      throw new Error();
    case "tuple":
      return { items: type.items.map(typeDefault) };
    case "union":
      return typeDefault(type.left);
    case "void":
      return undefined as any;
    default:
      throw new Error();
  }
}

export function typeItemLookup(
  type: WidgetType,
): (index: number) => WidgetType {
  switch (type.type) {
    case "any":
      return () => ({ type: "any" });
    case "array":
      return () => type.items;
    case "tuple":
      return (index) => type.items[index] ?? { type: "void" };
    case "union":
      const left = typeItemLookup(type.left);
      const right = typeItemLookup(type.right);
      return (index) => ({
        type: "union",
        left: left(index),
        right: right(index),
      });
    default:
      return () => ({
        type: "void",
      });
  }
}

export function typePropsLookup(type: WidgetType): (key: string) => WidgetType {
  switch (type.type) {
    case "any":
      return () => ({ type: "any" });
    case "dict":
      return () => type.values;
    case "object":
      return (key) => type.props[key] ?? { type: "void" };
    case "union":
      const left = typePropsLookup(type.left);
      const right = typePropsLookup(type.right);
      return (key) => ({ type: "union", left: left(key), right: right(key) });
    default:
      return () => ({ type: "void" });
  }
}

export function typeProperties(type: WidgetType): string[] {
  switch (type.type) {
    case "array":
      return ["length"];
    case "object":
      return Object.keys(type.props);
    case "tuple":
      return ["length"];
    case "union":
      return typeProperties(type.left);
    default:
      return [];
  }
}

type WidgetMemberType =
  | { type: "number" | "string" }
  | { type: "union"; left: WidgetMemberType; right: WidgetMemberType };

export function typeMemberType(
  type: WidgetType,
): WidgetMemberType | { type: "void" } {
  switch (type.type) {
    case "boolean":
    case "literal":
    case "number":
    case "string":
    case "primitive":
      return { type: "void" };
    case "array":
      return { type: "number" };
    case "dict":
      return { type: "string" };
    case "object":
      return { type: "string" };
    case "tuple":
      return { type: "number" };
    case "union":
      const left = typeMemberType(type.left);
      const right = typeMemberType(type.right);
      return unionType(left, right) as WidgetMemberType;
    default:
      return {
        type: "union",
        left: { type: "number" },
        right: { type: "string" },
      };
  }
}

export function fulfillsType(
  expect: WidgetType,
  actual: WidgetType,
): { same: boolean } {
  if (actual.type === "any") {
    return { same: true };
  } else if (actual.type === "union") {
    return {
      same:
        fulfillsType(expect, actual.left).same &&
        fulfillsType(expect, actual.right).same,
    };
  }
  switch (expect.type) {
    case "any":
      return { same: true };
    case "array":
      if (actual.type === "array") {
        return fulfillsType(expect.items, actual.items);
      } else if (actual.type === "tuple") {
        return {
          same: actual.items.every(
            (item) => fulfillsType(expect.items, item).same,
          ),
        };
      }
      return { same: false };
    case "boolean":
      if (actual.type === "boolean" || actual.type === "primitive") {
        return { same: true };
      }
      return { same: false };
    case "dict":
      if (actual.type === "dict") {
        return fulfillsType(expect.values, actual.values);
      } else if (actual.type === "object") {
        return {
          same: Object.values(actual.props).every(
            (item) => fulfillsType(expect.values, item).same,
          ),
        };
      }
      return { same: false };
    case "function":
      if (actual.type === "function") {
        return {
          same:
            expect.arguments.length <= actual.arguments.length &&
            actual.arguments.every(
              (item, index) => fulfillsType(expect.arguments[index], item).same,
            ) &&
            fulfillsType(expect.return, actual.return).same,
        };
      }
      return { same: false };
    case "number":
      if (actual.type === "number" || actual.type === "primitive") {
        return { same: true };
      }
      return { same: false };
    case "object":
      if (actual.type === "dict") {
        return {
          same: Object.values(expect.props).every(
            (item) => fulfillsType(item, actual.values).same,
          ),
        };
      } else if (actual.type === "object") {
        return {
          same: Object.entries(expect.props).every(
            ([key, item]) =>
              key in actual.props && fulfillsType(item, actual.props[key]).same,
          ),
        };
      }
    case "primitive":
      if (
        actual.type === "boolean" ||
        actual.type === "number" ||
        actual.type === "primitive" ||
        actual.type === "string"
      ) {
        return { same: true };
      }
      return { same: false };
    case "string":
      if (actual.type === "primitive" || actual.type === "string") {
        return { same: true };
      }
      return { same: false };
    case "symbol":
      return { same: false };
    case "tuple":
      if (actual.type === "array") {
        return {
          same: expect.items.every(
            (item) => fulfillsType(item, actual.items).same,
          ),
        };
      } else if (actual.type === "tuple") {
        return {
          same:
            expect.items.length === actual.items.length &&
            expect.items.every(
              (item, index) => fulfillsType(item, actual.items[index]).same,
            ),
        };
      }
      return { same: false };
    case "union":
      return {
        same:
          fulfillsType(expect.left, actual).same ||
          fulfillsType(expect.right, actual).same,
      };
    case "void":
      if (actual.type === "void") {
        return { same: true };
      }
      return { same: false };
    default:
      return { same: false };
  }
}

export function inferType(actual: any): WidgetType {
  switch (typeof actual) {
    case "boolean":
      return { type: "boolean" };
    case "function":
      return { type: "function", arguments: [], return: { type: "any" } };
    case "number":
      return { type: "number" };
    case "object":
      if (Array.isArray(actual)) {
        return { type: "tuple", items: actual.map(inferType) };
      }
      return {
        type: "object",
        props: Object.entries(actual).reduce(
          (carry, [key, item]) => ({ ...carry, [key]: inferType(item) }),
          {} as { [key: string]: WidgetType },
        ),
      };
    case "string":
      return { type: "string" };
    case "undefined":
      return { type: "void" };
    default:
      throw new Error("");
  }
}

function fitsAnyType(
  parameters: WidgetTypeParameters,
  value: WidgetValue,
): boolean {
  return true;
}

function fitsArrayType(
  parameters: WidgetTypeParameters,
  value: WidgetValue,
  itemType: WidgetType,
  fitsItemType: (
    parameters: WidgetTypeParameters,
    value: WidgetValue,
  ) => boolean,
): boolean {
  if (isWidgetTuple(value)) {
    return value.items.every(fitsItemType.bind(null, parameters));
  } else if (isWidgetParameter(value)) {
    return fulfillsType(
      { type: "array", items: itemType },
      parameters[value.parameter],
    ).same;
  }
  return false;
}

function fitsBooleanType(value: WidgetValue): boolean {
  return isWidgetDirect(value) && typeof value.direct === "boolean";
}

// function fitsNumberType(value: WidgetValue): boolean {
//   return isWidgetDirect(value) && typeof value.direct ===
// }

export function buildTypeFitter<W extends WidgetType>(
  type: W,
): (value: any) => boolean {
  switch (type.type) {
    case "boolean":
      return (value) => typeof value === "boolean";
    case "number":
      return (value) => typeof value === "number";
    case "string":
      return (value) => typeof value === "string";
    case "symbol":
      return (value) => typeof value === "symbol";
    case "tuple":
      return (value) => Array.isArray(value);
    case "array":
      return (value) => Array.isArray(value);
    case "object":
      return (value) => typeof value === "object" && value !== null;
    case "function":
      return (value) => typeof value === "function";
    default:
      throw new Error("unknown type");
  }
}

// class WidgetTypeCheck {
//   type: WidgetType;
//   fit: (value: any) => boolean;
//   fulfill: (
//     value: WidgetValue | WidgetType,
//     params: { [key: string]: WidgetType }
//   ) => boolean;
//   constructor({
//     type,
//     fit,
//     fulfill,
//   }: {
//     type: WidgetType;
//     fit: (value: any) => boolean;
//     fulfill: (
//       value: WidgetValue | WidgetType,
//       params: { [key: string]: WidgetType }
//     ) => boolean;
//   }) {
//     this.type = type;
//     this.fit = fit;
//     this.fulfill = fulfill;
//   }
// }

// export function buildTypeChecker(
//   type: WidgetType,
//   transform: WidgetTransform<any>
// ): WidgetTypeCheck {
//   switch (type.type) {
//     case "boolean":
//       return new WidgetTypeCheck({
//         type,
//         fit: (value) => typeof value === "boolean",
//         fulfill(value, params) {},
//       });
//     case "number":
//       return new WidgetTypeCheck({
//         type,
//         fit: (value) => typeof value === "number",
//       });
//     case "string":
//       return new WidgetTypeCheck({
//         type,
//         fit: (value) => typeof value === "string",
//       });
//     case "symbol":
//       return new WidgetTypeCheck({
//         type,
//         fit: (value) => typeof value === "symbol",
//       });
//     case "tuple":
//       return new WidgetTypeCheck({
//         type,
//         fit: (value) => Array.isArray(value),
//       });
//     case "array":
//       return new WidgetTypeCheck({
//         type,
//         fit: (value) => Array.isArray(value),
//       });
//     case "object":
//       return new WidgetTypeCheck({
//         type,
//         fit: (value) => typeof value === "object" && value !== null,
//       });
//     case "function":
//       return new WidgetTypeCheck({
//         type,
//         fit: (value) => typeof value === "function",
//       });
//     default:
//       throw new Error("unknown type");
//   }
// }
