import React, { useContext, useEffect } from "react";
import { InputModalHostContext, useInputModal } from "./InputModalHost";

export const InputModal = ({
  onOk,
  onCancel,
  children,
}: {
  onOk?: () => void;
  onCancel?: () => void;
  children: React.ReactElement;
}) => {
  useInputModal({ onOk, onCancel, body: children });
  return <></>;
};
