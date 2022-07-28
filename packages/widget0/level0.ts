import {
  WidgetClass,
  WidgetComparisonOperator,
  WidgetComparisonValue,
  WidgetConditionValue,
  WidgetData,
  WidgetDatabase,
  WidgetDataPicker,
  WidgetDirectValue,
  WidgetFoundation,
  WidgetMapValue,
  WidgetMemberValue,
  WidgetShapeValue,
  WidgetParameterValue,
  WidgetPropertyValue,
  WidgetRef,
  WidgetTagArray,
  WidgetTupleValue,
  WidgetValue,
  WidgetComputeValue,
  WidgetDeferValue,
} from ".";
import { WidgetType } from "WidgetLiteralType";

function containsTagString(tags: WidgetTagArray, tag: string) {
  for (let i = 0; i < tags.length; i++) {
    if (tags[i] === tag) {
      return true;
    }
  }
  return false;
}

enum WidgetTagTuplePresence {
  EQUIVALENT = "equivalent",
  DIFFERENT = "different",
  NOT_PRESENT = "notPresent",
}

function containsTagTuple(tags: WidgetTagArray, tagTuple: readonly string[]) {
  const [tagName] = tagTuple;
  for (let i = 0; i < tags.length; i++) {
    const tagItem = tags[i];
    if (Array.isArray(tagItem)) {
      if (tagItem[0] === tagName) {
        if (tagItem.length < tagTuple.length) {
          return WidgetTagTuplePresence.DIFFERENT;
        }
        for (let j = 1; j < tagTuple.length; j++) {
          if (tagItem[j] !== tagTuple[j]) {
            return WidgetTagTuplePresence.DIFFERENT;
          }
        }
        return WidgetTagTuplePresence.EQUIVALENT;
      }
    }
  }
  return WidgetTagTuplePresence.NOT_PRESENT;
}

function equalWidgetTags(left: WidgetTagArray, right: WidgetTagArray) {
  for (let i = 0; i < left.length; i++) {
    const leftItem = left[i];
    if (typeof leftItem === "string") {
      if (!containsTagString(right, leftItem)) {
        return false;
      }
    } else {
      if (
        containsTagTuple(right, leftItem) !== WidgetTagTuplePresence.EQUIVALENT
      ) {
        return false;
      }
    }
  }
  return true;
}

export class WidgetDatabaseMap implements WidgetDatabase {
  constructor(private map: Map<WidgetTagArray, WidgetData>) {}
  async *search(id: WidgetTagArray): AsyncIterable<WidgetData> {
    for (const key of this.map.keys()) {
      if (equalWidgetTags(id, key)) {
        yield this.map.get(key) as WidgetData;
      }
    }
  }
}

export class WidgetDatabaseGroup implements WidgetDatabase {
  constructor(private group: WidgetDatabase[]) {}
  async *search(id: WidgetTagArray): AsyncIterable<WidgetData> {
    for (const database of this.group) {
      yield* database.search(id);
    }
  }
}

export class WidgetFoundationMap<T> implements WidgetFoundation<T> {
  constructor(private map: Map<WidgetTagArray, WidgetClass<T, any>>) {}
  async search<P>(id: WidgetTagArray): Promise<WidgetClass<T, P> | null> {
    for (const key of this.map.keys()) {
      if (equalWidgetTags(id, key)) {
        return this.map.get(key) as WidgetClass<T, P>;
      }
    }
    return null;
  }
}

export class WidgetFoundationGroup<T> implements WidgetFoundation<T> {
  constructor(private group: WidgetFoundation<T>[]) {}
  async search(id: WidgetTagArray): Promise<WidgetClass<T, any> | null> {
    for (const foundation of this.group) {
      const result = await foundation.search(id);
      if (result) {
        return result;
      }
    }
    return null;
  }
}

export function isWidgetType(
  value: WidgetValue | WidgetType
): value is WidgetType {
  return "type" in value;
}

export function isWidgetDirect(value: WidgetValue): value is WidgetDirectValue {
  return "direct" in value;
}

export function isWidgetTuple(value: WidgetValue): value is WidgetTupleValue {
  return "items" in value;
}

export function isWidgetObject(value: WidgetValue): value is WidgetShapeValue {
  return "shape" in value;
}

export function isWidgetParameter(
  value: WidgetValue
): value is WidgetParameterValue {
  return "parameter" in value;
}

export function isWidgetProperty(
  value: WidgetValue
): value is WidgetPropertyValue {
  return "property" in value;
}

export function isWidgetMember(value: WidgetValue): value is WidgetMemberValue {
  return "member" in value;
}

export function isWidgetComparison(
  value: WidgetValue
): value is WidgetComparisonValue {
  return "operator" in value;
}

export function isWidgetCondition(
  value: WidgetValue
): value is WidgetConditionValue {
  return "ifTrue" in value;
}

export function isWidgetMap(value: WidgetValue): value is WidgetMapValue {
  return "map" in value;
}

export function isWidgetCompute(
  value: WidgetValue
): value is WidgetComputeValue {
  return "compute" in value;
}

export function isWidgetDefer(value: WidgetValue): value is WidgetDeferValue {
  return "defer" in value;
}

export function isWidgetRef(value: WidgetValue): value is WidgetRef {
  return "tags" in value;
}

export function* visitWidgetValue(value: WidgetValue): Generator<WidgetValue> {
  yield value;
  if (isWidgetTuple(value)) {
    for (const item of value.items) {
      yield* visitWidgetValue(item);
    }
  } else if (isWidgetObject(value)) {
    for (const key in value.shape) {
      yield* visitWidgetValue(value.shape[key]);
    }
  } else if (isWidgetProperty(value)) {
    yield* visitWidgetValue(value.target);
  } else if (isWidgetMember(value)) {
    yield* visitWidgetValue(value.target);
  } else if (isWidgetComparison(value)) {
    yield* visitWidgetValue(value.left);
    yield* visitWidgetValue(value.right);
  } else if (isWidgetCondition(value)) {
    yield* visitWidgetValue(value.condition);
    yield* visitWidgetValue(value.ifTrue);
    yield* visitWidgetValue(value.ifFalse);
  } else if (isWidgetMap(value)) {
    yield* visitWidgetValue(value.target);
    yield* visitWidgetValue(value.map);
  } else if (isWidgetCompute(value)) {
    yield* visitWidgetValue(value.compute);
  } else if (isWidgetDefer(value)) {
    yield* visitWidgetValue(value.defer);
  } else if (isWidgetRef(value)) {
    for (const key in value.parameters) {
      yield* visitWidgetValue(value.parameters[key]);
    }
  }
}

export function* visitWidgetRef(value: WidgetValue): Generator<WidgetRef> {
  for (const subvalue of visitWidgetValue(value)) {
    if (isWidgetRef(subvalue)) {
      yield subvalue;
    }
  }
}

interface WidgetPartialEvaluator<A extends any[]> {
  ref(value: WidgetRef, ...args: A): any;
  direct?(value: WidgetDirectValue, ...args: A): any;
  tuple?(value: WidgetTupleValue, ...args: A): any;
  shape?(value: WidgetShapeValue, ...args: A): any;
  parameter?(value: WidgetParameterValue, ...args: A): any;
  property?(value: WidgetPropertyValue, ...args: A): any;
  member?(value: WidgetMemberValue, ...args: A): any;
  comparison?(value: WidgetComparisonValue, ...args: A): any;
  condition?(value: WidgetConditionValue, ...args: A): any;
  map?(value: WidgetMapValue, ...args: A): any;
  compute?(value: WidgetComputeValue, ...args: A): any;
  defer?(value: WidgetDeferValue, ...args: A): any;
  value?(value: WidgetValue, ...args: A): any;
}

interface WidgetEvaluator<A extends any[]> {
  direct(value: WidgetDirectValue, ...args: A): any;
  tuple(value: WidgetTupleValue, ...args: A): any;
  shape(value: WidgetShapeValue, ...args: A): any;
  parameter(value: WidgetParameterValue, ...args: A): any;
  property(value: WidgetPropertyValue, ...args: A): any;
  member(value: WidgetMemberValue, ...args: A): any;
  ref(value: WidgetRef, ...args: A): any;
  comparison(value: WidgetComparisonValue, ...args: A): any;
  condition(value: WidgetConditionValue, ...args: A): any;
  map(value: WidgetMapValue, ...args: A): any;
  compute(value: WidgetComputeValue, ...args: A): any;
  defer(value: WidgetDeferValue, ...args: A): any;
  value(value: WidgetValue, ...args: A): any;
}

type WidgetTransform<A extends any[]> = (value: WidgetValue, ...args: A) => any;

export function buildWidgetComparison<A extends any[]>(
  transform: WidgetTransform<A>
): (value: WidgetComparisonValue, ...args: A) => any {
  return function (value, ...args) {
    switch (value.operator) {
      case WidgetComparisonOperator.EQUALS:
        return (
          transform(value.left, ...args) === transform(value.right, ...args)
        );
      case WidgetComparisonOperator.GREATER_THAN:
        return transform(value.left, ...args) > transform(value.right, ...args);
      case WidgetComparisonOperator.GREATER_THAN_EQUALS:
        return (
          transform(value.left, ...args) >= transform(value.right, ...args)
        );
      case WidgetComparisonOperator.LESS_THAN:
        return transform(value.left, ...args) < transform(value.right, ...args);
      case WidgetComparisonOperator.LESS_THAN_EQUALS:
        return (
          transform(value.left, ...args) <= transform(value.right, ...args)
        );
    }
  };
}

export function buildWidgetCondition<A extends any[]>(
  transform: WidgetTransform<A>
) {
  return function (value: WidgetConditionValue, ...args: A) {
    if (transform(value.condition, ...args)) {
      return transform(value.ifTrue, ...args);
    }
    return transform(value.ifFalse, ...args);
  };
}

export function buildWidgetMap<
  A extends [{ [key: string]: WidgetValue }, ...any[]]
>(transform: WidgetTransform<A>): (value: WidgetMapValue, ...args: A) => any {
  return function (value, params, ...args) {
    return (transform as any)(value.target, params, ...args).map((item) =>
      (transform as any)(
        value.map,
        { [value.argument]: item, ...params },
        ...args
      )
    );
  };
}

function buildWidgetValue<A extends any[]>(
  fullTransform: WidgetEvaluator<A>
): WidgetTransform<A> {
  return function (value: WidgetValue, ...args: A) {
    if (isWidgetDirect(value)) {
      return fullTransform.direct(value, ...args);
    } else if (isWidgetTuple(value)) {
      return fullTransform.tuple(value, ...args);
    } else if (isWidgetObject(value)) {
      return fullTransform.shape(value, ...args);
    } else if (isWidgetParameter(value)) {
      return fullTransform.parameter(value, ...args);
    } else if (isWidgetProperty(value)) {
      return fullTransform.property(value, ...args);
    } else if (isWidgetMember(value)) {
      return fullTransform.member(value, ...args);
    } else if (isWidgetComparison(value)) {
      return fullTransform.comparison(value, ...args);
    } else if (isWidgetCondition(value)) {
      return fullTransform.condition(value, ...args);
    } else if (isWidgetMap(value)) {
      return fullTransform.map(value, ...args);
    } else if (isWidgetCompute(value)) {
      return fullTransform.compute(value, ...args);
    } else if (isWidgetDefer(value)) {
      return fullTransform.defer(value, ...args);
    } else if (isWidgetRef(value)) {
      return fullTransform.ref(value, ...args);
    }
    throw new Error("not a WidgetValue");
  };
}

const notImplemented = () => {
  throw new Error("not implemented");
};

export function buildWidgetEvaluator<A extends any[]>(
  transform: WidgetPartialEvaluator<A>
): WidgetEvaluator<A> {
  const fullTransform: WidgetEvaluator<A> = {
    direct: notImplemented,
    tuple: notImplemented,
    shape: notImplemented,
    parameter: notImplemented,
    property: notImplemented,
    member: notImplemented,
    comparison: notImplemented,
    condition: notImplemented,
    map: notImplemented,
    value: notImplemented,
    compute: notImplemented,
    defer: notImplemented,
    ...transform,
  };
  if (fullTransform.value === notImplemented) {
    fullTransform.value = buildWidgetValue(fullTransform);
  }
  if (fullTransform.direct === notImplemented) {
    fullTransform.direct = ((value, ...args) => {
      return value.direct;
    }) as (value: WidgetDirectValue, ...args: A) => any;
  }
  if (fullTransform.tuple === notImplemented) {
    fullTransform.tuple = (value, ...args) => {
      return value.items.map((item) => fullTransform.value(item, ...args));
    };
  }
  if (fullTransform.shape === notImplemented) {
    fullTransform.shape = (value, ...args) => {
      return Object.entries(value.shape).reduce((carry, [key, value]) => {
        carry[key] = fullTransform.value(value, ...args);
        return carry;
      }, {});
    };
  }
  if (fullTransform.parameter === notImplemented) {
    fullTransform.parameter = (value, ...args) => {
      if (args.length > 0) {
        const [params] = args;
        return params[value.parameter];
      }
      throw new Error("parameters missing");
    };
  }
  if (fullTransform.property === notImplemented) {
    fullTransform.property = (value, ...args) => {
      return fullTransform.value(value.target, ...args)[value.property];
    };
  }
  if (fullTransform.member === notImplemented) {
    fullTransform.member = (value, ...args) => {
      return fullTransform.value(value.target, ...args)[
        fullTransform.value(value.member, ...args)
      ];
    };
  }

  if (fullTransform.comparison === notImplemented) {
    fullTransform.comparison = buildWidgetComparison(fullTransform.value);
  }

  if (fullTransform.condition === notImplemented) {
    fullTransform.condition = buildWidgetCondition(fullTransform.value);
  }

  if (fullTransform.map === notImplemented) {
    fullTransform.map = buildWidgetMap(fullTransform.value as any) as any;
  }

  if (fullTransform.compute === notImplemented) {
    fullTransform.compute = ((value, ...args) => {
      if (args.length > 0) {
        const [params, ...paramsArgs] = args;
        return (param) =>
          (fullTransform.value as any)(
            value.compute,
            { ...params, [value.argument]: param },
            ...paramsArgs
          );
      }
      throw new Error("args.length === 0");
    }) as (value: WidgetComputeValue, ...args: A) => any;
  }

  if (fullTransform.defer === notImplemented) {
    fullTransform.defer = (value, ...args) => {
      return () => fullTransform.value(value.defer, ...args);
    };
  }

  return fullTransform;
}

export class PickFirstWidgetData implements WidgetDataPicker {
  compare(first: WidgetData, second: WidgetData): number {
    return -1;
  }
}

export function pickWidget(widgets: WidgetData[], picker): WidgetData {
  return widgets.reduce((right, left) =>
    picker.compare(left, right) <= 0 ? left : right
  );
}

export function pickFirstWidget(
  widgets: WidgetData[],
  picker = new PickFirstWidgetData()
) {
  return pickWidget(widgets, picker);
}
