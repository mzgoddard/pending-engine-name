import {
  WidgetValue,
  WidgetDirectValue,
  WidgetTupleValue,
  WidgetShapeValue,
  WidgetParameterValue,
  WidgetPropertyValue,
  WidgetMemberValue,
  WidgetComparisonValue,
  WidgetConditionValue,
  WidgetMapValue,
  WidgetComputeValue,
  WidgetDeferValue,
} from "./index";

type TransformDirectValue<T extends WidgetValue> = T extends {
  direct: infer T2;
}
  ? T2
  : never;
type TransformTupleValue<
  T extends WidgetValue,
  P extends {
    [key: string]: any;
  }
> = T extends {
  items: infer T2;
}
  ? {
      [key in keyof T2]: TransformValue<Extract<T2[key], WidgetValue>, P>;
    }
  : never;
type TransformShapeValue<
  T extends WidgetValue,
  P extends {
    [key: string]: any;
  }
> = T extends {
  shape: infer T2;
}
  ? {
      [key in keyof T2]: TransformValue<Extract<T2[key], WidgetValue>, P>;
    }
  : never;
type TransformParameterValue<
  T extends WidgetValue,
  P extends {
    [key: string]: any;
  }
> = T extends {
  parameter: infer Key;
}
  ? Key extends keyof P
    ? P[Key]
    : never
  : never;
type TransformPropertyValue<
  T extends WidgetValue,
  P extends {
    [key: string]: any;
  }
> = T extends {
  target: infer T2;
  property: infer Key;
}
  ? TransformValue<Extract<T2, WidgetValue>, P> extends infer T2Sub
    ? Key extends keyof T2Sub
      ? T2Sub[Key]
      : never
    : never
  : never;
type TransformMemberValue<
  T extends WidgetValue,
  P extends {
    [key: string]: any;
  }
> = T extends {
  target: infer T2;
  member: infer T3;
}
  ? TransformValue<Extract<T2, WidgetValue>, P> extends infer T2Sub
    ? TransformValue<Extract<T3, WidgetValue>, P> extends infer T3Sub
      ? T3Sub extends keyof T2Sub
        ? T2Sub[T3Sub]
        : never
      : never
    : never
  : never;
type TransformConditionValue<
  T extends WidgetValue,
  P extends {
    [key: string]: any;
  }
> = T extends {
  ifTrue: infer T2;
  ifFalse: infer T3;
}
  ?
      | TransformValue<Extract<T2, WidgetValue>, P>
      | TransformValue<Extract<T3, WidgetValue>, P>
  : never;
type TransformMapValue<
  T extends WidgetValue,
  P extends {
    [key: string]: any;
  }
> = T extends {
  target: infer T2;
  argument: infer Key;
  map: infer T3;
}
  ? TransformValue<
      Extract<T3, WidgetValue>,
      {
        [key in keyof P | Extract<Key, string>]: key extends Key
          ? TransformValue<Extract<T2, WidgetValue>, P> extends (infer T2Sub)[]
            ? T2Sub
            : never
          : key extends keyof P
          ? P[key]
          : never;
      }
    >[]
  : never;
type TransformComputeValue<
  T extends WidgetValue,
  P extends {
    [key: string]: any;
  }
> = T extends {
  argument: infer Key;
  compute: infer T2;
}
  ? <S>(argument: S) => TransformValue<
      Extract<T2, WidgetValue>,
      {
        [key in keyof P | Extract<Key, string>]: key extends Key
          ? S
          : key extends keyof P
          ? P[key]
          : never;
      }
    >
  : never;
type TransformDeferValue<
  T extends WidgetValue,
  P extends {
    [key: string]: any;
  }
> = T extends {
  defer: infer T2;
}
  ? () => TransformValue<Extract<T2, WidgetValue>, P>
  : never;

export type TransformValue<
  T extends WidgetValue,
  P extends { [key: string]: any }
> = T extends WidgetDirectValue
  ? TransformDirectValue<T>
  : T extends WidgetTupleValue
  ? TransformTupleValue<T, P>
  : T extends WidgetShapeValue
  ? TransformShapeValue<T, P>
  : T extends WidgetParameterValue
  ? TransformParameterValue<T, P>
  : T extends WidgetPropertyValue
  ? TransformPropertyValue<T, P>
  : T extends WidgetMemberValue
  ? TransformMemberValue<T, P>
  : T extends WidgetComparisonValue
  ? boolean
  : T extends WidgetConditionValue
  ? TransformConditionValue<T, P>
  : T extends WidgetMapValue
  ? TransformMapValue<T, P>
  : T extends WidgetComputeValue
  ? TransformComputeValue<T, P>
  : T extends WidgetDeferValue
  ? TransformDeferValue<T, P>
  : never;
