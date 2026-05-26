"use client";

import {
  SyntheticEvent,
  ComponentProps,
  useId,
  useEffect,
  createContext,
  RefObject,
  ReactNode,
  useState,
  useContext,
  useRef,
} from "react";
import styles from "./styles.module.scss";
import { c } from "@/lib/utils/client";
import { createPortal } from "react-dom";
import {
  CreateProjectDialog,
  CreateStatusDialog,
  CreateTaskDialog,
  LoginDialog,
  UpdateStatusDialog,
  UpdateTaskDialog,
  ViewTaskDialog,
} from "./dialogs";

interface DialogProps extends Omit<
  ComponentProps<"dialog">,
  "ref" | "onClose"
> {
  onCancel?: (e: SyntheticEvent<HTMLDialogElement>) => void;
  isOpen: boolean;
  onClose: (e: Event) => void;
  ref: RefObject<HTMLDialogElement | null>;
}
const Dialog = ({
  id,
  children,
  className,
  onCancel,
  ref: dialogRef,
  isOpen = true,
  onClose = () => {},
  ...props
}: DialogProps) => {
  const dialogId = id ?? useId();
  const preRef = useRef<HTMLDialogElement>(null);
  if (!dialogRef) dialogRef = preRef;

  useEffect(() => {
    if (!dialogRef?.current) {
      return;
    }
    if (isOpen) {
      if (!dialogRef.current.open) dialogRef.current.showModal();
    } else {
      if (dialogRef.current.open) dialogRef.current.close();
    }
  }, [isOpen]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const handleCancel: typeof onClose = (e) => {
      if (isOpen) {
        onClose?.(e);
      }
    };
    dialogRef.current?.addEventListener("close", handleCancel);
    return () => {
      dialogRef.current?.removeEventListener("close", handleCancel);
    };
  }, [isOpen, onClose]);

  const portalRoot =
    typeof window !== "undefined"
      ? document.getElementById("dialog_root")
      : null;

  if (!portalRoot || !isOpen || !mounted) return null;

  return createPortal(
    <dialog
      {...props}
      closedby="any"
      ref={dialogRef}
      id={dialogId}
      className={c(styles.dialog, className)}
    >
      {children}
    </dialog>,
    portalRoot,
  );
};
export default Dialog;

type ModalType =
  | "CREATE_TASK"
  | "VIEW_TASK"
  | "EDIT_TASK"
  | "CREATE_STATUS"
  | "EDIT_STATUS"
  | "CREATE_PROJECT"
  | "EDIT_PROJECT"
  | "LOGIN"
  | null;

interface DialogContextType {
  activeModal: ModalType;
  modalData: Record<string, any>;
  openModal: (type: ModalType, data: Record<string, any>) => void;
  closeModal?: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<ModalType>();
  const [modalData, setModalData] = useState<Record<string, any>>({});

  const openModal = (type: ModalType, data: Record<string, any>) => {
    setActiveModal(type);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData({});
  };

  return (
    <DialogContext.Provider
      value={{
        activeModal: activeModal!,
        modalData,
        openModal: openModal,
        closeModal: closeModal ?? (() => {}),
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialogs = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialogs not in context");
  return context;
};

export const DialogManager = () => {
  const { activeModal, closeModal } = useDialogs();

  return (
    <>
      <CreateTaskDialog
        onClose={closeModal!}
        isOpen={activeModal === "CREATE_TASK"}
      />
      <ViewTaskDialog
        onClose={closeModal!}
        className={styles.view_task_dialog}
        isOpen={activeModal === "VIEW_TASK"}
      />
      <CreateStatusDialog
        onClose={closeModal!}
        isOpen={activeModal === "CREATE_STATUS"}
      />
      <UpdateStatusDialog
        onClose={closeModal!}
        isOpen={activeModal === "EDIT_STATUS"}
      />
      <CreateProjectDialog
        onClose={closeModal!}
        isOpen={activeModal === "CREATE_PROJECT"}
      />
      <UpdateTaskDialog
        onClose={closeModal!}
        isOpen={activeModal === "EDIT_TASK"}
      />
      <LoginDialog onClose={closeModal!} isOpen={activeModal === "LOGIN"} />
    </>
  );
};
