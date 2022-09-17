import React, { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import {
  evalValueType,
  fulfillsType,
  fulfillType,
  typeDefault,
  typeMemberType,
  typeProperties,
} from "../../../../fit-type";
import {
  isWidgetBoolean,
  isWidgetComparison,
  isWidgetCompute,
  isWidgetCondition,
  isWidgetDirect,
  isWidgetMap,
  isWidgetMember,
  isWidgetNumber,
  isWidgetObject,
  isWidgetParameter,
  isWidgetProperty,
  isWidgetRef,
  isWidgetString,
  isWidgetTuple,
} from "../../../../level0";
import {
  WidgetDefinition,
  WidgetTypeParameters,
} from "../../../../widget-data";
import { WidgetTupleType, WidgetType } from "../../../../widget-type";
import {
  WidgetComparisonOperator,
  WidgetComputeValue,
  WidgetRef,
  WidgetTagArray,
  WidgetValue,
} from "../../../../widget-value";

import { useDatabase } from "../../database";
import { ContextMenuItem, ContextMenuOrigin } from "./ContextMenu";
import { InputModal } from "./InputModal";
import { OrderButtonBar } from "./OrderButtonBar";
import { State, StateContext, StateMachine } from "./StateMachine";

import "./ValueSlot.css";
import { widgetName } from "./widgetName";
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
    return <SelectValue {...{ setValue, parameters }} />;
  } else if (isWidgetDirect(value)) {
    switch (typeof value.direct) {
      case "boolean":
        return (
          <KnownValueWidgetValue
            parameters={parameters}
            value={value}
            setValue={setValue}
          >
            <select
              value={value.direct.toString()}
              onChange={(ev) => {
                {
                  setValue({ direct: JSON.parse(ev.target.value) });
                }
              }}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </KnownValueWidgetValue>
        );
      case "number":
        return (
          <KnownValueWidgetValue
            parameters={parameters}
            value={value}
            setValue={setValue}
          >
            <input
              type="text"
              contentEditable
              // key={value.direct.toString()}
              defaultValue={value.direct}
              onChange={(ev) => {
                console.log("onChange");
                setValue({
                  direct: Number((ev.target as HTMLInputElement).value),
                });
              }}
            ></input>
          </KnownValueWidgetValue>
        );
      case "string":
        return (
          <KnownValueWidgetValue
            parameters={parameters}
            value={value}
            setValue={setValue}
          >
            <input
              type="text"
              onChange={(ev) => setValue({ direct: ev.target.value })}
              value={value.direct}
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
        <KnownValueWidgetValue
          parameters={parameters}
          value={value}
          setValue={setValue}
        >
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
        <KnownValueWidgetValue
          parameters={parameters}
          value={value}
          setValue={setValue}
        >
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
    return (
      <>
        {" "}
        <ValueSlot
          parameters={parameters}
          type={{ type: "any" }}
          value={value.left}
          setValue={(left) => setValue({ ...value, left })}
        ></ValueSlot>{" "}
        <select
          onChange={(ev) =>
            setValue({
              ...value,
              operator: ev.target.value as WidgetComparisonOperator,
            })
          }
        >
          <option value="equals">=</option>
          <option value="greaterThan">&gt;</option>
          <option value="greaterThanEquals">&gt;=</option>
          <option value="lessThan">&lt;</option>
          <option value="lessThanEquals">&lt;=</option>
        </select>{" "}
        <ValueSlot
          parameters={parameters}
          type={evalValueType(value.left, parameters)}
          value={value.right}
          setValue={(right) => setValue({ ...value, right })}
        ></ValueSlot>{" "}
      </>
    );
  } else if (isWidgetCondition(value)) {
    return (
      <>
        {" "}
        <ValueSlot
          parameters={parameters}
          type={type}
          value={value.ifTrue}
          setValue={(ifTrue) => setValue({ ...value, ifTrue })}
        ></ValueSlot>{" "}
        if{" "}
        <ValueSlot
          parameters={parameters}
          type={{ type: "boolean" }}
          value={value.condition}
          setValue={(condition) => setValue({ ...value, condition })}
        ></ValueSlot>{" "}
        else{" "}
        <div style={{ paddingLeft: "1em" }}>
          <ValueSlot
            parameters={parameters}
            type={type}
            value={value.ifFalse}
            setValue={(ifFalse) => setValue({ ...value, ifFalse })}
          ></ValueSlot>
        </div>
      </>
    );
  } else if (isWidgetParameter(value)) {
    return (
      <KnownValueWidgetValue
        parameters={parameters}
        value={value}
        setValue={setValue}
      >
        {value.parameter}
      </KnownValueWidgetValue>
    );
  } else if (isWidgetProperty(value)) {
    return (
      <>
        {" "}
        <ValueSlot
          parameters={parameters}
          type={type}
          value={value.target}
          setValue={setValue}
        />{" "}
        <StateMachine defaultState={() => ({ state: "init" })}>
          <StateContext.Consumer>
            {({ setState }) => (
              <ContextMenuOrigin
                menu={
                  <>
                    <ContextMenuItem onClick={() => setValue(value.target)}>
                      remove property
                    </ContextMenuItem>
                    <ContextMenuItem
                      disabled={
                        typeProperties(evalValueType(value.target, parameters))
                          .length === 0
                      }
                      onClick={() =>
                        setState({
                          state: "change property",
                          propertyKey: value.property,
                        })
                      }
                    >
                      change property
                    </ContextMenuItem>
                    <ContextMenuItem
                      disabled={
                        typeProperties(evalValueType(value, parameters))
                          .length === 0
                      }
                      onClick={() =>
                        setState({
                          state: "add property",
                          propertyKey: typeProperties(
                            evalValueType(value, parameters),
                          ),
                        })
                      }
                    >
                      add property
                    </ContextMenuItem>
                  </>
                }
              >
                {value.property}{" "}
                <State on={{ state: "change property" }}>
                  <StateContext.Consumer>
                    {({ state: { propertyKey }, assignState, reset }) => (
                      <InputModal
                        onOk={() => {
                          reset();
                          setValue({
                            target: value.target,
                            property: propertyKey,
                          });
                        }}
                        onCancel={reset}
                      >
                        <select
                          onChange={(ev) =>
                            assignState({ propertyKey: ev.target.value })
                          }
                        >
                          {typeProperties(
                            evalValueType(value.target, parameters),
                          ).map((prop) => (
                            <option
                              value={prop}
                              selected={propertyKey === prop}
                            >
                              {prop}
                            </option>
                          ))}
                        </select>
                      </InputModal>
                    )}
                  </StateContext.Consumer>
                </State>
                <State on={{ state: "add property" }}>
                  <StateContext.Consumer>
                    {({ state: { propertyKey }, assignState, reset }) => (
                      <InputModal
                        onOk={() => {
                          reset();
                          setValue({
                            target: value,
                            property: propertyKey,
                          });
                        }}
                        onCancel={reset}
                      >
                        <select
                          onChange={(ev) =>
                            assignState({ propertyKey: ev.target.value })
                          }
                        >
                          {typeProperties(evalValueType(value, parameters)).map(
                            (prop) => (
                              <option
                                value={prop}
                                selected={propertyKey === prop}
                              >
                                {prop}
                              </option>
                            ),
                          )}
                        </select>
                      </InputModal>
                    )}
                  </StateContext.Consumer>
                </State>
              </ContextMenuOrigin>
            )}
          </StateContext.Consumer>
        </StateMachine>
      </>
    );
  } else if (isWidgetMember(value)) {
    return (
      <>
        <ContextMenuOrigin
          menu={
            <>
              <ContextMenuItem onClick={() => setValue(value.target)}>
                remove member
              </ContextMenuItem>
            </>
          }
        >
          member{" "}
          <ValueSlot
            parameters={parameters}
            type={typeMemberType(evalValueType(value.target, parameters))}
            value={value.member}
            setValue={(member) => setValue({ ...value, member })}
          ></ValueSlot>{" "}
          of{" "}
          <ValueSlot
            parameters={parameters}
            type={{ type: "any" }}
            value={value.target}
            setValue={(target) => setValue({ ...value, target })}
          ></ValueSlot>{" "}
        </ContextMenuOrigin>
      </>
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
      <KnownValueWidgetValue
        parameters={parameters}
        value={value}
        setValue={setValue}
      >
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

const KnownValueWidgetValue = ({ parameters, value, setValue, children }) => {
  return (
    <>
      <StateMachine defaultState={() => ({ state: "init" })}>
        <StateContext.Consumer>
          {({ setState }) => (
            <ContextMenuOrigin
              menu={
                <>
                  <ContextMenuItem
                    onClick={() =>
                      setState({ state: "change value", newValue: value })
                    }
                  >
                    change value
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() =>
                      setValue({
                        condition: {
                          operator: "equals",
                          left: { direct: true },
                          right: { direct: false },
                        },
                        ifTrue: value,
                        ifFalse: value,
                      })
                    }
                  >
                    add condition
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={
                      typeProperties(evalValueType(value, parameters))
                        .length === 0
                    }
                    onClick={() =>
                      setState({
                        state: "add property",
                        propertyKey: typeProperties(
                          evalValueType(value, parameters),
                        ),
                      })
                    }
                  >
                    add property
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={
                      typeMemberType(evalValueType(value, parameters)).type ===
                      "void"
                    }
                    onClick={() =>
                      setValue({
                        target: value,
                        member: typeDefault(
                          typeMemberType(evalValueType(value, parameters)),
                        ),
                      })
                    }
                  >
                    add member
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={
                      !fulfillsType(
                        { type: "array", items: { type: "any" } },
                        evalValueType(value, parameters),
                      ).same
                    }
                    onClick={() => {}}
                  >
                    map value
                  </ContextMenuItem>
                </>
              }
            >
              {children}
            </ContextMenuOrigin>
          )}
        </StateContext.Consumer>
        <State on={{ state: "change value" }}>
          <StateContext.Consumer>
            {({ state: { newValue }, setState, assignState }) => (
              <InputModal
                onOk={() => {
                  setState({ state: "init" });
                  setValue(newValue);
                }}
                onCancel={() => setState({ state: "init" })}
              >
                <SelectValue
                  value={newValue}
                  setValue={(newValue) => assignState({ newValue })}
                  parameters={parameters}
                />
              </InputModal>
            )}
          </StateContext.Consumer>
        </State>
        <State on={{ state: "add property" }}>
          <StateContext.Consumer>
            {({ state: { propertyKey }, assignState, reset }) => (
              <InputModal
                onOk={() => {
                  reset();
                  setValue({ target: value, property: propertyKey });
                }}
                onCancel={reset}
              >
                <select
                  onChange={(ev) =>
                    assignState({ propertyKey: ev.target.value })
                  }
                >
                  {typeProperties(evalValueType(value, parameters)).map(
                    (prop) => (
                      <option value={prop} selected={propertyKey === prop}>
                        {prop}
                      </option>
                    ),
                  )}
                </select>
              </InputModal>
            )}
          </StateContext.Consumer>
        </State>
      </StateMachine>
    </>
  );
};

const UnsetValue = ({
  value,
  setValue,
  parameters,
}: {
  value?: WidgetValue;
  setValue: SetWidgetValue;
  parameters: {};
}) => {
  return <></>;
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

function SelectValue({
  value,
  setValue,
  parameters,
}: {
  value?: WidgetValue;
  setValue: (value: WidgetValue) => void;
  parameters: {};
}) {
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
              const parameterIndex = parseInt(value.slice("parameter-".length));
              return setValue({
                parameter: Object.keys(parameters)[parameterIndex],
              });
            }
            throw new Error(`ev.target.value === ${ev.target.value}`);
        }
      }}
    >
      <option value="direct-boolean" selected={value && isWidgetBoolean(value)}>
        boolean
      </option>
      <option value="direct-string" selected={value && isWidgetString(value)}>
        string
      </option>
      <option value="direct-number" selected={value && isWidgetNumber(value)}>
        number
      </option>
      <option value="items" selected={value && isWidgetTuple(value)}>
        tuple
      </option>
      <option value="shape" selected={value && isWidgetObject(value)}>
        shape
      </option>
      <option value="compute" selected={value && isWidgetCompute(value)}>
        function
      </option>
      {Object.entries(parameters).map(([key], index) => (
        <option
          value={`parameter-${index}`}
          selected={
            value && isWidgetParameter(value) && value.parameter === key
          }
        >
          parameter: {key}
        </option>
      ))}
      <option value="ref" selected={value && isWidgetRef(value)}>
        ref
      </option>
    </select>
  );
}

function ValueSlotWidgetRef({
  parameters,
  setValue,
  value,
  def,
}: {
  parameters: { [key: string]: WidgetType };
  setValue: (value: WidgetValue) => void;
  value: WidgetRef;
  def: WidgetDefinition;
}) {
  const database = useDatabase();
  const [newParamKey, setNewParamKey] = useState("");
  const [state, setState] = useState(
    () => ({ state: "init" } as ValueSlotWidgetRefState),
  );
  return (
    <KnownValueWidgetValue
      parameters={parameters}
      value={value}
      setValue={setValue}
    >
      <div>
        <button
          onClick={() => setState({ state: "chooseWidget", tags: value.tags })}
        >
          choose widget
        </button>
      </div>
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
            <div>current widget: {def ? widgetName(def) : "not found"}</div>
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
                  {widgetName(def)}
                </div>
              ))}
            </div>
          </>
        </InputModal>
      ) : null}
      <div>
        widget:{" "}
        {def ? (
          <Link to={`/widget/${def.id}`}>{widgetName(def)}</Link>
        ) : (
          "not found"
        )}
      </div>
      <div>paramters:</div>
      <table>
        {Object.entries(value?.parameters ?? {}).map(
          ([key, param], index, entries) => (
            <tr>
              <td valign="top">
                <OrderButtonBar.Props
                  container={value?.parameters ?? {}}
                  setContainer={(parameters) =>
                    setValue({ ...value, parameters })
                  }
                  index={index}
                  length={entries.length}
                />{" "}
                {key}
              </td>
              <td>
                <div></div>
                <div>
                  <ValueSlot
                    parameters={parameters}
                    type={{ type: "any" }}
                    value={param}
                    setValue={(param) =>
                      setValue({
                        id: value.id,
                        tags: value.tags,
                        parameters: { ...value?.parameters, [key]: param },
                      })
                    }
                  ></ValueSlot>
                </div>
              </td>
            </tr>
          ),
        )}
        <tr>
          <td>
            <StateMachine defaultState={() => ({ state: "init" })}>
              <StateContext.Consumer>
                {({ setState }) => (
                  <button
                    onClick={() =>
                      setState({
                        state: "add",
                        newParamKey: Object.keys(def?.parameters ?? {}).filter(
                          (key) => !(key in (value?.parameters ?? {})),
                        )[0],
                      })
                    }
                    disabled={
                      Object.keys(def?.parameters ?? {}).filter(
                        (key) => !(key in (value?.parameters ?? {})),
                      ).length === 0
                    }
                  >
                    add
                  </button>
                )}
              </StateContext.Consumer>
              <State on={{ state: "add" }}>
                <StateContext.Consumer>
                  {({ state: { newParamKey }, setState, assignState }) => (
                    <InputModal
                      onOk={() => {
                        setState({ state: "init" });
                        setValue({
                          id: value.id,
                          tags: value.tags,
                          parameters: {
                            ...value?.parameters,
                            [newParamKey]: typeDefault(
                              def?.parameters[newParamKey],
                            ),
                          },
                        });
                      }}
                      onCancel={() => setState({ state: "init" })}
                    >
                      <select
                        onChange={(ev) =>
                          assignState({ newParamKey: ev.target.value })
                        }
                      >
                        {Object.keys(def?.parameters ?? {})
                          .filter((key) => !(key in value.parameters))
                          .map((key) => (
                            <option value={key}>{key}</option>
                          ))}
                      </select>
                    </InputModal>
                  )}
                </StateContext.Consumer>
              </State>
            </StateMachine>
          </td>
          <td></td>
        </tr>
      </table>
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
