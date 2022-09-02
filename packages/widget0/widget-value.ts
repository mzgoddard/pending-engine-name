export interface WidgetDirectValue {
  direct: boolean | number | string | symbol;
}

export interface WidgetTupleValue {
  items: WidgetValue[];
}

export interface WidgetShapeValue {
  shape: { [key: string]: WidgetValue };
}

export interface WidgetParameterValue {
  parameter: string;
}

export interface WidgetPropertyValue {
  target: WidgetValue;
  property: string;
}

export interface WidgetMemberValue {
  target: WidgetValue;
  member: WidgetValue;
}

export enum WidgetComparisonOperator {
  EQUALS = "equals",
  GREATER_THAN = "greaterThan",
  LESS_THAN = "lessThan",
  GREATER_THAN_EQUALS = "greaterThanEquals",
  LESS_THAN_EQUALS = "lessThanEquals",
}

export interface WidgetComparisonValue {
  operator: WidgetComparisonOperator;
  left: WidgetValue;
  right: WidgetValue;
}

export interface WidgetConditionValue {
  condition: WidgetValue;
  ifTrue: WidgetValue;
  ifFalse: WidgetValue;
}

export interface WidgetMapValue {
  target: WidgetValue;
  map: WidgetComputeValue;
}

export interface WidgetComputeValue {
  arguments: string[];
  compute: WidgetValue;
}

export interface WidgetDeferValue {
  defer: WidgetValue;
}

export type WidgetTag = readonly [string, ...string[]];

export interface WidgetTagArray extends ReadonlyArray<WidgetTag> {}

export interface WidgetRef {
  id: string;
  tags: WidgetTagArray;
  parameters: { [key: string]: WidgetValue };
}

export type WidgetValue =
  | WidgetDirectValue
  | WidgetTupleValue
  | WidgetShapeValue
  | WidgetParameterValue
  | WidgetPropertyValue
  | WidgetMemberValue
  | WidgetComparisonValue
  | WidgetConditionValue
  | WidgetMapValue
  | WidgetComputeValue
  | WidgetRef;
