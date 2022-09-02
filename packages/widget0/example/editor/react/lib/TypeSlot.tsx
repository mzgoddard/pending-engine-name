import React, { ReactNode, useState } from "react";
import {
  WidgetObjectType,
  WidgetTupleType,
  WidgetType,
} from "../../../../widget-type";

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
    return (
      <ConfiguredTypeHeader setType={setType}>string</ConfiguredTypeHeader>
    );
  } else if (type.type === "number") {
    return (
      <ConfiguredTypeHeader setType={setType}>number</ConfiguredTypeHeader>
    );
  } else if (type.type === "boolean") {
    return (
      <ConfiguredTypeHeader setType={setType}>boolean</ConfiguredTypeHeader>
    );
  } else if (type.type === "array") {
    return (
      <div>
        <div>
          <ConfiguredTypeHeader setType={setType}>array</ConfiguredTypeHeader>
        </div>
        <div>
          items:
          <TypeSlot
            type={type.items}
            setType={(itemType) => setType({ type: "array", items: itemType })}
          ></TypeSlot>
        </div>
      </div>
    );
  } else if (type.type === "tuple") {
    return TypeSlotTuple(setType, type);
  } else if (type.type === "object") {
    return TypeSlotObject(setType, type);
  } else if (type.type === "dict") {
    return (
      <div>
        <div>
          <ConfiguredTypeHeader setType={setType}>dict</ConfiguredTypeHeader>
        </div>
        <div>
          values:
          <TypeSlot
            type={type.values}
            setType={(itemType) => setType({ type: "dict", values: itemType })}
          ></TypeSlot>
        </div>
      </div>
    );
  } else if (type.type === "function") {
    return (
      <div>
        <div>
          <ConfiguredTypeHeader setType={setType}>
            function
          </ConfiguredTypeHeader>
        </div>
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
      </div>
    );
  } else if (type.type === "union") {
  } else if (type.type === "void") {
    return <ConfiguredTypeHeader setType={setType}>void</ConfiguredTypeHeader>;
  }

  return (
    <select
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
};

const UnsetType = ({ setType }) => {
  return (
    <button onClick={() => setType(INITIAL_WIDGET_TYPE.any)}>
      change type
    </button>
  );
};

function TypeSlotTuple(setType: WidgetSetType, type: WidgetTupleType) {
  return (
    <div>
      <div>
        <ConfiguredTypeHeader setType={setType}>tuple</ConfiguredTypeHeader>
      </div>
      <div>
        <div>items:</div>
        {TypeSlotItems(
          (items) => setType({ type: "tuple", items }),
          type.items,
        )}
      </div>
    </div>
  );
}

interface WidgetSetItemsType {
  (items: WidgetType[]): void;
}

function TypeSlotItems(
  setItems: WidgetSetItemsType,
  items: readonly WidgetType[],
) {
  return (
    <>
      <div>
        {items.map((item, index) =>
          TypeSlotOrderedRow(setItems, items, index, item),
        )}
      </div>
      <button onClick={() => setItems([...items, { type: "any" }])}>add</button>
    </>
  );
}

function TypeSlotOrderedRow(
  setItems: (items: WidgetType[]) => void,
  items: readonly WidgetType[],
  index: number,
  item: WidgetType,
): JSX.Element {
  return (
    <div>
      <div
        onClick={() =>
          setItems([...items.slice(0, index), ...items.slice(index + 1)])
        }
      >
        remove
      </div>
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
    </div>
  );
}

function TypeSlotObject(setType: WidgetSetType, type: WidgetObjectType) {
  return (
    <div>
      <ConfiguredTypeHeader setType={setType}>object</ConfiguredTypeHeader>
      <div>
        <div>items:</div>
        <table>
          {Object.entries(type.props).map(([key, item], index) =>
            TypeSlotKeyedRow(setType, type, index, key, item),
          )}
          <tr>
            <td></td>
            <td>{TypeSlotObjectAddProp(setType, type)}</td>
          </tr>
        </table>
      </div>
    </div>
  );
}

function TypeSlotObjectAddProp(
  setType: WidgetSetType<WidgetType>,
  type: WidgetObjectType,
) {
  const [newKeyName, setNewKeyName] = useState("");
  return (
    <div>
      <input
        type="text"
        value={newKeyName}
        onChange={(ev) => setNewKeyName(ev.target.value)}
      ></input>
      <button
        onClick={() =>
          setType({
            type: "object",
            props: { ...type.props, [newKeyName]: { type: "any" } },
          })
        }
      >
        add
      </button>
    </div>
  );
}

function TypeSlotKeyedRow(
  setType: WidgetSetType,
  type: WidgetObjectType,
  index: number,
  key: string,
  item: WidgetType,
): JSX.Element {
  return (
    <tr>
      <td>{key}</td>
      <td>
        <button
          onClick={() =>
            setType({
              type: "object",
              props: Object.entries(type.props).reduce(
                (carry, [eachKey, value]) =>
                  key === eachKey ? carry : { ...carry, [eachKey]: value },
                {},
              ),
            })
          }
        >
          remove
        </button>
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
