import React, { createContext, useContext } from "react";
import { createPortal, render } from "react-dom";

let _menuPortalElement;
export const getMenuPortalElement = () => {
  if (_menuPortalElement === undefined) {
    _menuPortalElement = document.createElement("div");
    Object.assign(_menuPortalElement.style, {
      position: "absolute",
      left: "0",
      top: "0",
      height: "100%",
      width: "100%",
      pointerEvents: "none",
    });
    document.body.appendChild(_menuPortalElement);
  }
  return _menuPortalElement;
};

export const ContextMenuItem = ({ children, disabled = false, onClick }) => {
  const menu = useContextMenu();
  return (
    <button
      disabled={disabled}
      style={{ display: "block", flex: "1" }}
      onClick={() => {
        menu.hideMenu();
        onClick();
      }}
    >
      {children}
    </button>
  );
};

export const ContextMenuBody = ({
  children,
  left,
  top,
  onLeave = () => undefined,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        pointerEvents: "auto",
        background: "white",
      }}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
};

export const ContextMenuOrigin = ({ children, menu }) => {
  const contextMenu = useContextMenu();
  return (
    <span
      onContextMenu={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        console.log([ev.clientX, ev.clientY]);
        console.log([ev.offsetX, ev.offsetY]);
        console.log([
          ev.pageX,
          ev.pageY,
          document.body.clientWidth,
          document.body.clientHeight,
        ]);
        console.log([
          ev.screenX,
          ev.screenY,
          window.innerWidth,
          window.innerHeight,
        ]);
        contextMenu.showMenu(menu, { left: ev.pageX, top: ev.pageY });
      }}
    >
      {children}
    </span>
  );
};

export const ContextMenu = ({
  children,
}: {
  children: React.ReactFragment;
}) => {
  return createPortal(children, getMenuPortalElement());
};

ContextMenu.Item = ContextMenuItem;

const hideMenu = () => {
  render(<></>, getMenuPortalElement());
};
export const ContextMenuContext = createContext({
  showMenu(menu, options) {
    render(
      <ContextMenuBody {...options} onLeave={hideMenu}>
        {menu}
      </ContextMenuBody>,
      getMenuPortalElement(),
    );
  },
  hideMenu,
});

export const useContextMenu = () => useContext(ContextMenuContext);
