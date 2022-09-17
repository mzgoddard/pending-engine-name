import React, { ReactNode, useState } from "react";
import {
  WidgetObjectType,
  WidgetPrimitiveType,
  WidgetTupleType,
  WidgetType,
} from "../../../../widget-type";
import { ContextMenuItem, ContextMenuOrigin } from "./ContextMenu";
import { InputModal } from "./InputModal";
import { OrderButtonBar } from "./OrderButtonBar";
import { State, StateContext, StateMachine } from "./StateMachine";

interface WidgetParameters {
  [key: string]: WidgetType;
}

interface WidgetSetType<T extends WidgetType = WidgetType> {
  (type: T): void;
}

const INITIAL_WIDGET_TYPE: { [key in WidgetType["type"]]: WidgetType } = {
  any: { type: "any" },
  string: { type: "string" },
  symbol: { type: "symbol" },
  number: { type: "number" },
  boolean: { type: "boolean" },
  primitive: { type: "primitive" },
  array: { type: "array", items: { type: "any" } },
  tuple: { type: "tuple", items: [] },
  object: { type: "object", props: {} },
  dict: { type: "dict", values: { type: "any" } },
  closure: { type: "closure", parameters: {}, value: { direct: false } },
  function: {
    type: "function",
    arguments: [],
    return: { type: "any" },
  },
  union: {
    type: "union",
    left: { type: "any" },
    right: { type: "any" },
  },
  void: { type: "void" },
};

export const TypeSlot = ({
  type,
  setType,
}: {
  type: WidgetType;
  setType: WidgetSetType;
}) => {
  if (type.type === "string") {
    return <TypeSlotMenu {...{ type, setType }}>string</TypeSlotMenu>;
  } else if (type.type === "number") {
    return (
      <TypeSlotMenu type={type} setType={setType}>
        number
      </TypeSlotMenu>
    );
  } else if (type.type === "boolean") {
    return (
      <TypeSlotMenu type={type} setType={setType}>
        boolean
      </TypeSlotMenu>
    );
  } else if (type.type === "array") {
    return (
      <TypeSlotMenu type={type} setType={setType}>
        array
        <div>
          items:
          <TypeSlot
            type={type.items}
            setType={(itemType) => setType({ type: "array", items: itemType })}
          ></TypeSlot>
        </div>
      </TypeSlotMenu>
    );
  } else if (type.type === "tuple") {
    return TypeSlotTuple(setType, type);
  } else if (type.type === "object") {
    return TypeSlotObject(setType, type);
  } else if (type.type === "dict") {
    return (
      <TypeSlotMenu type={type} setType={setType}>
        dict
        <div>
          values:
          <TypeSlot
            type={type.values}
            setType={(itemType) => setType({ type: "dict", values: itemType })}
          ></TypeSlot>
        </div>
      </TypeSlotMenu>
    );
  } else if (type.type === "function") {
    return (
      <TypeSlotMenu type={type} setType={setType}>
        function
        <div>arguments:</div>
        {TypeSlotItems(
          (items) =>
            setType({
              type: "function",
              arguments: items,
              return: type.return,
            }),
          type.arguments,
        )}
        <div>
          return:
          <TypeSlot
            type={type.return}
            setType={(returnType) =>
              setType({
                type: "function",
                arguments: type.arguments,
                return: returnType,
              })
            }
          ></TypeSlot>
        </div>
      </TypeSlotMenu>
    );
  } else if (type.type === "union") {
  } else if (type.type === "void") {
    return <ConfiguredTypeHeader setType={setType}>void</ConfiguredTypeHeader>;
  }

  return <TypeSlotSelectType {...{ setType }} />;
};

const UnsetType = ({ setType }) => {
  return (
    <button onClick={() => setType(INITIAL_WIDGET_TYPE.any)}>
      change type
    </button>
  );
};

function TypeSlotMenu({
  children,
  type,
  setType,
}: {
  children: React.ReactNode;
  type: WidgetType;
  setType: WidgetSetType<WidgetType>;
}) {
  return (
    <StateMachine defaultState={() => ({ state: "init" })}>
      <StateContext.Consumer>
        {({ setState }) => (
          <ContextMenuOrigin
            menu={
              <>
                <ContextMenuItem
                  onClick={() =>
                    setState({ state: "change type", newType: type })
                  }
                >
                  change type
                </ContextMenuItem>
              </>
            }
          >
            {children}
          </ContextMenuOrigin>
        )}
      </StateContext.Consumer>
      <State on={{ state: "change type" }}>
        <StateContext.Consumer>
          {({ state: { newType }, assignState, reset }) => (
            <InputModal
              onOk={() => {
                reset();
                setType(newType);
              }}
              onCancel={reset}
            >
              <TypeSlotSelectType
                type={newType}
                setType={(newType) => assignState({ newType })}
              />
            </InputModal>
          )}
        </StateContext.Consumer>
      </State>
    </StateMachine>
  );
}

function TypeSlotSelectType({
  type,
  setType,
}: {
  type?: WidgetType;
  setType: WidgetSetType<WidgetType>;
}) {
  return (
    <select
      value={type?.type ?? "any"}
      onChange={(ev) => {
        setType(INITIAL_WIDGET_TYPE[ev.target.value]);
      }}
    >
      <option value={"any"}>any</option>
      <option value={"string"}>string</option>
      <option value={"number"}>number</option>
      <option value={"boolean"}>boolean</option>
      <option value={"array"}>array</option>
      <option value={"tuple"}>tuple</option>
      <option value={"object"}>object</option>
      <option value={"dict"}>dict</option>
      <option value={"function"}>function</option>
      <option value={"union"}>union</option>
      <option value={"void"}>void</option>
    </select>
  );
}

function TypeSlotTuple(setType: WidgetSetType, type: WidgetTupleType) {
  return (
    <TypeSlotMenu type={type} setType={setType}>
      tuple
      <div>
        <div>items:</div>
        {TypeSlotItems(
          (items) => setType({ type: "tuple", items }),
          type.items,
        )}
      </div>
    </TypeSlotMenu>
  );
}

interface WidgetSetItemsType {
  (items: readonly WidgetType[]): void;
}

function TypeSlotItems(
  setItems: WidgetSetItemsType,
  items: readonly WidgetType[],
) {
  return (
    <>
      <table>
        {items.map((item, index) =>
          TypeSlotOrderedRow(setItems, items, index, item),
        )}
        <tr>
          <td>
            <button onClick={() => setItems([...items, { type: "any" }])}>
              add
            </button>
          </td>
        </tr>
      </table>
    </>
  );
}

function TypeSlotOrderedRow(
  setItems: (items: readonly WidgetType[]) => void,
  items: readonly WidgetType[],
  index: number,
  item: WidgetType,
): JSX.Element {
  return (
    <tr>
      <td>
        <OrderButtonBar.Items
          container={items}
          setContainer={(items) => setItems(items)}
          index={index}
          length={items.length}
        />
      </td>
      <td>
        <TypeSlot
          type={item}
          setType={(indexType) =>
            setItems([
              ...items.slice(0, index),
              indexType,
              ...items.slice(index + 1),
            ])
          }
        ></TypeSlot>
      </td>
    </tr>
  );
}

function TypeSlotObject(setType: WidgetSetType, type: WidgetObjectType) {
  return (
    <TypeSlotMenu type={type} setType={setType}>
      object
      <div>
        <div>items:</div>
        <table>
          {Object.entries(type.props).map(([key, item], index, entries) =>
            TypeSlotKeyedRow(setType, type, index, entries.length, key, item),
          )}
          <tr>
            <td>{TypeSlotObjectAddProp(setType, type)}</td>
            <td></td>
          </tr>
        </table>
      </div>
    </TypeSlotMenu>
  );
}

function TypeSlotObjectAddProp(
  setType: WidgetSetType<WidgetType>,
  type: WidgetObjectType,
) {
  return (
    <div>
      <StateMachine defaultState={() => ({ state: "init" })}>
        <StateContext.Consumer>
          {({ setState }) => (
            <button
              onClick={() => setState({ state: "add item", newKeyName: "" })}
            >
              add
            </button>
          )}
        </StateContext.Consumer>
        <State on={{ state: "add item" }}>
          <StateContext.Consumer>
            {({ state: { newKeyName }, assignState, reset }) => (
              <InputModal
                onOk={() => {
                  reset();
                  setType({
                    type: "object",
                    props: { ...type.props, [newKeyName]: { type: "any" } },
                  });
                }}
                onCancel={reset}
              >
                <input
                  type="text"
                  defaultValue={newKeyName}
                  onChange={(ev) =>
                    assignState({ newKeyName: ev.target.value })
                  }
                ></input>
              </InputModal>
            )}
          </StateContext.Consumer>
        </State>
      </StateMachine>
    </div>
  );
}

function TypeSlotKeyedRow(
  setType: WidgetSetType,
  type: WidgetObjectType,
  index: number,
  length: number,
  key: string,
  item: WidgetType,
): JSX.Element {
  return (
    <tr>
      <td valign="top">
        <OrderButtonBar.Props
          container={type.props}
          setContainer={(props) => setType({ type: "object", props })}
          index={index}
          length={length}
        />{" "}
        {key}
      </td>
      <td>
        <TypeSlot
          type={item}
          setType={(indexType) =>
            setType({
              type: "object",
              props: { ...type.props, [key]: indexType },
            })
          }
        ></TypeSlot>
      </td>
    </tr>
  );
}

function ConfiguredTypeHeader({
  setType,
  children,
}: {
  setType: WidgetSetType;
  children: ReactNode;
}) {
  return (
    <span>
      <UnsetType setType={setType}></UnsetType>
      {children}
    </span>
  );
}
