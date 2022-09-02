import React, { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import {
  evalValueType,
  fulfillType,
  typeDefault,
  typeMemberType,
} from "../../../../fit-type";
import {
  isWidgetComparison,
  isWidgetCompute,
  isWidgetCondition,
  isWidgetDirect,
  isWidgetMap,
  isWidgetMember,
  isWidgetObject,
  isWidgetParameter,
  isWidgetProperty,
  isWidgetRef,
  isWidgetTuple,
} from "../../../../level0";
import {
  WidgetDefinition,
  WidgetTypeParameters,
} from "../../../../widget-data";
import { WidgetTupleType, WidgetType } from "../../../../widget-type";
import {
  WidgetComputeValue,
  WidgetRef,
  WidgetTagArray,
  WidgetValue,
} from "../../../../widget-value";

import { useDatabase } from "../../database";
import { InputModal } from "./InputModal";

import "./ValueSlot.css";
import { WidgetTagsInnerEditor } from "./WidgetTagsInnerEditor";

type SetWidgetValue = (value: WidgetValue) => void;

export function ValueSlot({
  parameters,
  type,
  value,
  setValue,
}: {
  parameters: {};
  type: WidgetType;
  value: WidgetValue;
  setValue: (value: WidgetValue) => void;
}) {
  const database = useDatabase();
  const [newTagItem, setNewTagItem] = useState("");
  if (!value) {
    switch (type.type) {
      case "string":
        break;
      case "number":
        break;
      case "boolean":
        break;
      case "symbol":
        break;
      case "function":
        break;
      case "array":
        break;
      case "object":
        break;
      case "tuple":
        break;
      case "void":
        break;
      default:
        type.type;
        break;
    }
    return (
      <select
        onChange={(ev) => {
          const value = ev.target.value;
          switch (ev.target.value) {
            case "direct-boolean":
              return setValue(typeDefault({ type: "boolean" }));
            case "direct-string":
              return setValue(typeDefault({ type: "string" }));
            case "direct-number":
              return setValue(typeDefault({ type: "number" }));
            case "items":
              return setValue(
                typeDefault({ type: "array", items: { type: "any" } }),
              );
            case "shape":
              return setValue({ shape: {} });
            case "compute":
              return setValue({ arguments: [], compute: { direct: "" } });
            case "ref":
              return setValue({ id: "", tags: [], parameters: {} });
            default:
              if (value.startsWith("parameter-")) {
                const parameterIndex = parseInt(
                  value.slice("parameter-".length),
                );
                return setValue({
                  parameter: Object.keys(parameters)[parameterIndex],
                });
              }
              throw new Error(`ev.target.value === ${ev.target.value}`);
          }
        }}
      >
        <option>---</option>
        <option value="direct-boolean">boolean</option>
        <option value="direct-string">string</option>
        <option value="direct-number">number</option>
        <option value="items">tuple</option>
        <option value="shape">shape</option>
        <option value="compute">function</option>
        {Object.entries(parameters).map(([key], index) => (
          <option value={`parameter-${index}`}>parameter: {key}</option>
        ))}
        <option value="ref">ref</option>
      </select>
    );
  } else if (isWidgetDirect(value)) {
    switch (typeof value.direct) {
      case "boolean":
        return (
          <KnownValueWidgetValue parameters={parameters} setValue={setValue}>
            <select
              value={value.direct.toString()}
              onChange={(ev) => setValue({ direct: Boolean(ev.target.value) })}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </KnownValueWidgetValue>
        );
      case "number":
        return (
          <KnownValueWidgetValue parameters={parameters} setValue={setValue}>
            <input
              type="text"
              value={value.direct}
              onChange={(ev) => setValue({ direct: Number(ev.target.value) })}
            ></input>
          </KnownValueWidgetValue>
        );
      case "string":
        return (
          <KnownValueWidgetValue parameters={parameters} setValue={setValue}>
            <input
              type="text"
              value={value.direct}
              onChange={(ev) => setValue({ direct: ev.target.value })}
            ></input>
          </KnownValueWidgetValue>
        );
      case "symbol":
        break;
    }
  } else if (isWidgetTuple(value)) {
    let rowType = (index: number): WidgetType => ({ type: "any" });
    let removeValue =
      (index: number): (() => void) | undefined =>
      () =>
        setValue({ items: removeIndex(value.items, index) });
    let addValue = (
      <KnownValueAddRow
        type={{ type: "any" }}
        addValue={(item) => setValue({ items: addItem(value.items, item) })}
      ></KnownValueAddRow>
    );
    if (type.type === "array") {
      rowType = () => type.items;
      addValue = (
        <KnownValueAddRow
          type={type.items}
          addValue={(item) => setValue({ items: addItem(value.items, item) })}
        ></KnownValueAddRow>
      );
    } else if (type.type === "tuple") {
      rowType = (index) => type.items[index] ?? { type: "void" };
      removeValue = (index: number): (() => void) | undefined => undefined;
      addValue = <></>;
    }
    return (
      <KnownValueWidgetManyValue>
        <KnownValueWidgetValue parameters={parameters} setValue={setValue}>
          tuple
        </KnownValueWidgetValue>
        <table>
          {value.items.map((item, index) => (
            <KnownValueRow removeValue={removeValue(index)} name={index}>
              <ValueSlot
                parameters={parameters}
                type={rowType(index)}
                value={item}
                setValue={(item) =>
                  setValue({ items: replaceIndex(value.items, index, item) })
                }
              ></ValueSlot>
            </KnownValueRow>
          ))}
          <tr>
            <td></td>
            <td>{addValue}</td>
          </tr>
        </table>
      </KnownValueWidgetManyValue>
    );
  } else if (isWidgetObject(value)) {
    const [newKey, setKey] = useState("");
    let rowType = (key: string): WidgetType => ({ type: "any" });
    let removeValue =
      (key: string): (() => void) | undefined =>
      () =>
        setValue({ shape: removeKey(value.shape, key) });
    let addValue = (
      <KnownValueAddRow
        type={{ type: "any" }}
        addValue={(item) =>
          setValue({ shape: addKey(value.shape, newKey, item) })
        }
      >
        <input type="text" onChange={(ev) => setKey(ev.target.value)}></input>
      </KnownValueAddRow>
    );
    if (type.type === "dict") {
      rowType = () => type.values;
      addValue = (
        <KnownValueAddRow
          type={type.values}
          addValue={(item) =>
            setValue({ shape: addKey(value.shape, newKey, item) })
          }
        >
          <input type="text" onChange={(ev) => setKey(ev.target.value)}></input>
        </KnownValueAddRow>
      );
    } else if (type.type === "object") {
      rowType = (key) => type.props[key] ?? { type: "void" };
      addValue = <></>;
    }
    return (
      <KnownValueWidgetManyValue>
        <KnownValueWidgetValue parameters={parameters} setValue={setValue}>
          shape
        </KnownValueWidgetValue>
        <table>
          {Object.entries(value.shape).map(([key, item]) => (
            <KnownValueRow removeValue={removeValue(key)} name={key}>
              <ValueSlot
                parameters={parameters}
                type={rowType(key)}
                value={item}
                setValue={(item) =>
                  setValue({ shape: replaceKey(value.shape, key, item) })
                }
              ></ValueSlot>
            </KnownValueRow>
          ))}
          <tr>
            <td></td>
            <td>{addValue}</td>
          </tr>
        </table>
      </KnownValueWidgetManyValue>
    );
  } else if (isWidgetComparison(value)) {
    return <div></div>;
  } else if (isWidgetCondition(value)) {
    return (
      <KnownValueWidgetValue parameters={parameters} setValue={setValue}>
        <ValueSlot
          parameters={parameters}
          type={{ type: "boolean" }}
          value={value.condition}
          setValue={(condition) => setValue({ ...value, condition })}
        ></ValueSlot>
        <ValueSlot
          parameters={parameters}
          type={type}
          value={value.ifTrue}
          setValue={(ifTrue) => setValue({ ...value, ifTrue })}
        ></ValueSlot>
        <ValueSlot
          parameters={parameters}
          type={type}
          value={value.ifFalse}
          setValue={(ifFalse) => setValue({ ...value, ifFalse })}
        ></ValueSlot>
      </KnownValueWidgetValue>
    );
  } else if (isWidgetParameter(value)) {
    return (
      <KnownValueWidgetValue parameters={parameters} setValue={setValue}>
        {value.parameter}
      </KnownValueWidgetValue>
    );
  } else if (isWidgetProperty(value)) {
    return (
      <div>
        <ValueSlot
          parameters={parameters}
          type={{ type: "any" }}
          value={value.target}
          setValue={() => null}
        />
        .<select></select>
      </div>
    );
  } else if (isWidgetMember(value)) {
    return (
      <div>
        <ValueSlot
          parameters={parameters}
          type={{ type: "any" }}
          value={value.target}
          setValue={() => null}
        ></ValueSlot>
        [
        <ValueSlot
          parameters={parameters}
          type={{
            type: "union",
            left: { type: "string" },
            right: { type: "string" },
          }}
          value={value.member}
          setValue={() => null}
        ></ValueSlot>
        ]
      </div>
    );
  } else if (isWidgetMap(value)) {
    return (
      <div>
        <ValueSlot
          parameters={parameters}
          type={{ type: "any" }}
          value={value.target}
          setValue={(target) => setValue({ target, map: value.map })}
        ></ValueSlot>
        <ValueSlot
          parameters={parameters}
          type={{
            type: "function",
            arguments: [
              evalValueType(
                { target: value.target, member: { direct: 0 } },
                parameters,
              ),
            ],
            return:
              type.type === "any"
                ? { type: "any" }
                : type.type === "array"
                ? type.items
                : { type: "void" },
          }}
          value={value.map}
          setValue={(map) =>
            setValue({ target: value.target, map: map as WidgetComputeValue })
          }
        ></ValueSlot>
      </div>
    );
  } else if (isWidgetCompute(value)) {
    return (
      <KnownValueWidgetValue parameters={parameters} setValue={setValue}>
        <div>arguments:</div>
        <div></div>
        <div>return:</div>
        <div>
          <ValueSlot
            parameters={parameters}
            type={{ type: "any" }}
            value={value.compute}
            setValue={(compute) =>
              setValue({ arguments: value.arguments, compute })
            }
          ></ValueSlot>
        </div>
      </KnownValueWidgetValue>
    );
    // } else if (isWidgetDefer(value)) {
    //   return <div>defer</div>;
  } else if (isWidgetRef(value)) {
    const def = value.id ? database.get(value.id) : (undefined as any);
    return (
      <ValueSlotWidgetRef
        {...{
          parameters,
          setValue,
          value,
          def,
        }}
      />
    );
  }
  return (
    <div onClick={() => setValue(undefined as any)}>
      unexpected WidgetValue {JSON.stringify(value)}
    </div>
  );
  throw new Error(`unexpected WidgetValue ${JSON.stringify(value)}`);
}

// const ValueSlotPickGroup: React.FC = ({ children }) => {
//   return <div>{children}</div>;
// };

// const ValueSlotPickDirect = ({ parameters, type, setValue }) => {
//   return (
//     <button
//       disabled={!fulfillType(type, { type: "primitive" })}
//       click={() => setValue()}
//     >
//       direct
//     </button>
//   );
// };

// const ValueSlotPickParameter = ({ parameters, type, setValue }) => {
//   return (
//     <button
//       disabled={Object.values(parameters).length > 0}
//       click={() => setValue()}
//     >
//       parameter
//     </button>
//   );
// };

// const ValueSlotPickTuple = ({ parameters, type, setValue }) => {
//   return (
//     <button
//       disabled={["any", "array", "tuple"].indexOf(type.type) > -1}
//       click={() => setValue()}
//     >
//       tuple
//     </button>
//   );
// };

// const ValueSlotPickShape = ({ parameters, type, setValue }) => {
//   return (
//     <button
//       disabled={["any", "object"].indexOf(type.type) > -1}
//       click={() => setValue()}
//     >
//       shape
//     </button>
//   );
// };

// const ValueSlotPickComparison = ({ parameters, type, setValue }) => {
//   return (
//     <button
//       disabled={["any", "primitive", "boolean"].indexOf(type.type) > -1}
//       click={() => setValue()}
//     >
//       comparison
//     </button>
//   );
// };

// const ValueSlotPickCompute = ({ parameters, type, setValue }) => {
//   return (
//     <button
//       disabled={["any", "function"].indexOf(type.type) > -1}
//       click={() => setValue()}
//     >
//       compute
//     </button>
//   );
// };

// const ValueSlotPickDefer = ({ parameters, type, setValue }) => {
//   return (
//     <button
//       disabled={["any", "function"].indexOf(type.type) > -1}
//       click={() => setValue()}
//     >
//       defer
//     </button>
//   );
// };

// const ValueSlotPickRef = ({
//   parameters,
//   type,
//   setValue,
// }: {
//   parameters: WidgetTypeParameters;
//   type: WidgetType;
//   setValue: SetWidgetValue;
// }) => {
//   return <button onClick={() => setValue()}>reference</button>;
// };

const KnownValueWidgetValue = ({ parameters, setValue, children }) => {
  return (
    <>
      <UnsetValue setValue={setValue}></UnsetValue>
      {children}
    </>
  );
};

const UnsetValue = ({ setValue }: { setValue: SetWidgetValue }) => {
  return (
    <button onClick={() => setValue(undefined as any)}>change value</button>
  );
};

const ReplaceWithParameter = ({
  parameters,
  setValue,
}: {
  parameters: WidgetTypeParameters;
  setValue: SetWidgetValue;
}) => {
  return (
    <div onClick={() => setValue({ parameter: Object.keys(parameters)[0] })}>
      P
    </div>
  );
};

const ReplaceWithRef = ({ setValue }: { setValue: SetWidgetValue }) => {
  return <div onClick={() => setValue({ tags: [], parameters: {} })}>R</div>;
};

const KnownValueWidgetManyValue = ({ children }) => {
  return <>{children}</>;
};

const KnownValueRows = ({ children, values }) => {
  return <>{children}</>;
};

const KnownValueRow = ({
  name,
  removeValue,
  children,
}: {
  name?: number | string;
  removeValue?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <tr>
      <td>{name}</td>
      <td>
        {removeValue ? (
          <button onClick={() => removeValue()}>remove</button>
        ) : null}
        {children}
      </td>
    </tr>
  );
};

const KnownValueAddRow = ({
  type,
  addValue,
  children,
}: {
  type: WidgetType;
  addValue: (item: WidgetValue) => void;
  children?: React.ReactNode;
}) => {
  return (
    <>
      {children}
      <button onClick={() => addValue(typeDefault(type))}>add</button>
    </>
  );
};

interface ValueSlotWidgetRefInitState {
  state: "init";
}
interface ValueSlotWidgetRefChooseWidgetState {
  state: "chooseWidget";
  tags: WidgetTagArray;
}
type ValueSlotWidgetRefState =
  | ValueSlotWidgetRefInitState
  | ValueSlotWidgetRefChooseWidgetState;

function ValueSlotWidgetRef({
  parameters,
  setValue,
  value,
  def,
}: {
  parameters: {};
  setValue: (value: WidgetValue) => void;
  value: WidgetRef;
  def: WidgetDefinition;
}) {
  const database = useDatabase();
  const [newParamKey, setNewParamKey] = useState("");
  const [state, setState] = useState(
    () => ({ state: "init" } as ValueSlotWidgetRefState),
  );
  console.log("state", state);
  return (
    <KnownValueWidgetValue parameters={parameters} setValue={setValue}>
      <button
        onClick={() => setState({ state: "chooseWidget", tags: value.tags })}
      >
        choose widget
      </button>
      {state.state === "chooseWidget" ? (
        <InputModal
          onOk={() => {
            setState({ state: "init" });
            setValue({ ...value, tags: state.tags });
          }}
          onCancel={() => setState({ state: "init" })}
        >
          <>
            <div>tags:</div>
            <div>
              <WidgetTagsInnerEditor
                tags={state.tags}
                setTags={(tags) => setState({ state: "chooseWidget", tags })}
              ></WidgetTagsInnerEditor>
            </div>
            <div>
              current widget:{" "}
              {def
                ? def.id.slice(def.id.length - 8, def.id.length)
                : "not found"}
            </div>
            <div>results</div>
            <div>
              {database.find(state.tags).map((def) => (
                <div>
                  <button
                    onClick={() => {
                      setState({ state: "init" });
                      setValue({ ...value, id: def.id, tags: state.tags });
                    }}
                  >
                    select
                  </button>
                  {def.id}
                </div>
              ))}
            </div>
          </>
        </InputModal>
      ) : null}
      <div>
        widget:{" "}
        {def ? (
          <Link to={`/widget/${def.id}/edit`}>
            {def.id.slice(def.id.length - 8, def.id.length)}
          </Link>
        ) : (
          "not found"
        )}
      </div>
      <div>paramters:</div>
      <div>
        {Object.entries(value.parameters).map(([key, param]) => (
          <div>
            {key}:{" "}
            <ValueSlot
              parameters={parameters}
              type={{ type: "any" }}
              value={param}
              setValue={(param) =>
                setValue({
                  id: value.id,
                  tags: value.tags,
                  parameters: { ...value.parameters, [key]: param },
                })
              }
            ></ValueSlot>
          </div>
        ))}
        <div>
          <select onChange={(ev) => setNewParamKey(ev.target.value)}>
            <option>---</option>
            {Object.keys(def?.parameters ?? {})
              .filter((key) => !(key in value.parameters))
              .map((key) => (
                <option value={key}>{key}</option>
              ))}
          </select>
          <button
            onClick={() =>
              setValue({
                id: value.id,
                tags: value.tags,
                parameters: {
                  ...value.parameters,
                  [newParamKey]: undefined as any,
                },
              })
            }
          >
            add
          </button>
        </div>
      </div>
    </KnownValueWidgetValue>
  );
}

function replaceIndex<T>(ary: readonly T[], index: number, item: T): T[] {
  return [...ary.slice(0, index), item, ...ary.slice(index + 1)];
}

function removeIndex<T>(ary: readonly T[], index: number): T[] {
  return [...ary.slice(0, index), ...ary.slice(index + 1)];
}

function addItem<T>(ary: readonly T[], item: T): T[] {
  return [...ary, item];
}

function replaceKey<
  T extends { [key: string]: any },
  K extends keyof T,
  I extends T[K],
>(obj: T, key: K, item: I): T {
  return { ...obj, [key]: item };
}

function removeKey<T extends { [key: string]: any }, K extends string>(
  obj: T,
  key: K,
): string extends K
  ? T
  : { [key in keyof T | K]: key extends K ? never : T[key] } {
  const { [key]: _, ...picked } = obj;
  return picked as any;
}

function addKey<T extends { [key: string]: any }, K extends string, I>(
  obj: T,
  key: K,
  item: I,
): { [key in keyof T | K]: key extends K ? I : T[key] } {
  return { ...obj, [key]: item };
}

function addTag(tags: WidgetTagArray, newTagItem: string): WidgetTagArray {
  if (newTagItem.trim() === "") {
    if (tags.length > 0 && tags[tags.length - 1].length > 0) {
      return [...tags, []] as any;
    }
    return tags;
  }
  return [...head(tags), [...(tags[tags.length - 1] ?? []), newTagItem]];
}

function head<T>(ary: readonly T[] = []): readonly T[] {
  return ary.slice(0, ary.length - 1);
}
