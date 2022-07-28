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
  argument: string;
  map: WidgetValue;
}

export interface WidgetComputeValue {
  argument: string;
  compute: WidgetValue;
}

export interface WidgetDeferValue {
  defer: WidgetValue;
}

export type WidgetTag = string | readonly [string, ...string[]];

export interface WidgetTagArray extends Array<WidgetTag> {}

export interface WidgetRef {
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
  | WidgetDeferValue
  | WidgetRef;
