import React from "react";
import { WidgetType } from "../../../../widget-type";

export function OrderButtonBar<
  T extends readonly any[] | { readonly [key: string]: any },
>({
  container,
  setContainer,
  index,
  length,
  onMove,
  onRemove,
}: {
  container: T;
  setContainer: (container: T) => void;
  index: number;
  length: number;
  onMove: (container: T, index: number, change: number) => T;
  onRemove: (container: T, index: number) => T;
}) {
  return (
    <>
      <button onClick={() => setContainer(onRemove(container, index))}>
        ✖
      </button>
      <button
        disabled={index === 0}
        onClick={() => setContainer(onMove(container, index, -1))}
      >
        ▲
      </button>
      <button
        disabled={index >= length - 1}
        onClick={() => setContainer(onMove(container, index, 1))}
      >
        ▼
      </button>
    </>
  );
}

OrderButtonBar.Items = function ItemsButtonBar<T extends readonly any[]>({
  container,
  setContainer,
  index,
  length,
}: {
  container: T;
  setContainer: (container: T) => void;
  index: number;
  length: number;
}) {
  return (
    <OrderButtonBar
      container={container}
      setContainer={setContainer}
      index={index}
      length={length}
      onMove={moveItemsIndex}
      onRemove={removeItemsIndex}
    />
  );
};

OrderButtonBar.Props = function PropsButtonBar<
  T extends { readonly [key: string]: any },
>({
  container,
  setContainer,
  index,
  length,
}: {
  container: T;
  setContainer: (container: T) => void;
  index: number;
  length: number;
}) {
  return (
    <OrderButtonBar
      container={container}
      setContainer={setContainer}
      index={index}
      length={length}
      onMove={movePropsIndex}
      onRemove={removePropsIndex}
    />
  );
};

function removePropsIndex<T extends { readonly [key: string]: any }>(
  props: T,
  index: number,
): T {
  const key = Object.keys(props)[index];
  const { [key]: _, ...rest } = props;
  return rest as any;
}

function movePropsIndex<T extends { readonly [key: string]: any }>(
  props: T,
  index: number,
  change: number,
): T {
  const keys = Object.keys(props);
  const key = keys[index];
  keys[index] = keys[index + change];
  keys[index + change] = key;
  return keys.reduce((carry, key) => {
    carry[key] = props[key];
    return carry;
  }, {}) as any;
}

function removeItemsIndex<T extends readonly any[]>(
  items: T,
  index: number,
): T {
  return [...items.slice(0, index), ...items.slice(index + 1)] as any;
}

function moveItemsIndex<T extends readonly any[]>(
  items: T,
  index: number,
  change: number,
): T {
  const newItems = items.slice();
  const item = newItems[index];
  newItems[index] = newItems[index + change];
  newItems[index + change] = item;
  return newItems as any;
}
