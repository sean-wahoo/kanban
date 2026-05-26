"use client";

import {
  ComponentProps,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./styles.module.scss";
import { c } from "@/lib/utils/client";
import { useMounted } from "@/lib/hooks";

export type DropdownOption = ComponentProps<"li"> &
  ComponentProps<"button"> & {
    item: React.ReactNode;
    value?: string;
    icon?: string;
  };
interface DropdownProps extends ComponentProps<"ul"> {
  enabled?: boolean;
  options?: DropdownOption[];
  triggerId: string;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  ref?: React.Ref<HTMLUListElement>;
}

const Dropdown = ({
  id,
  options,
  triggerId,
  triggerRef,
  className,
  children = null,
  enabled = true,
  ref: passedRef,
  ...props
}: DropdownProps) => {
  const dropdownId = useId();
  const dropdownRef = useRef<HTMLUListElement>(null);
  useImperativeHandle(passedRef, () => dropdownRef.current!, [dropdownRef]);

  const [isOpen, setIsOpen] = useState(false);

  const mounted = useMounted();

  useEffect(() => {
    if (dropdownRef.current && mounted) {
      const triggerEls = [
        ...document.querySelectorAll(
          `button[data-dropdown-trigger="${triggerId}"]`,
        ),
      ] as HTMLButtonElement[];
      if (triggerEls.length > 0) {
        for (const triggerEl of triggerEls) {
          triggerEl.popoverTargetElement = dropdownRef.current;
          triggerEl.popoverTargetAction = "toggle";
        }
      }
    }
  }, [triggerId, dropdownRef, mounted, triggerRef, options]);

  useEffect(() => {
    const clickOutsideListener = (e: MouseEvent) => {
      const t = e.target as Node;
      const clickedOutsideDropdown = !dropdownRef.current?.contains(t);
      const clickedOutsideTrigger =
        !triggerRef?.current?.contains(t) &&
        triggerRef &&
        triggerRef.current !== t;

      if (clickedOutsideDropdown && clickedOutsideTrigger && isOpen) {
        dropdownRef.current?.hidePopover();
      }
    };

    document.addEventListener("click", clickOutsideListener);
    return () => document.removeEventListener("click", clickOutsideListener);
  }, [triggerRef?.current, isOpen, dropdownRef.current]);

  return (
    <ul
      {...props}
      id={dropdownId}
      ref={dropdownRef}
      className={c(styles.dropdown, className)}
      popover={props.popover ?? "auto"}
      onToggle={(e) => {
        setIsOpen(e.newState === "open");
      }}
    >
      {options?.map(({ item, onClick, id }, index) => {
        return (
          <li
            className={styles.option}
            key={`dropdown-${dropdownId}-${id ?? dropdownId + index}`}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(e);

              if (
                (
                  e.target as HTMLLIElement
                ).childNodes?.[0]?.nodeName?.toUpperCase() === "BUTTON"
              ) {
                const buttonEl = (e.target as HTMLLIElement)
                  .childNodes[0] as HTMLButtonElement;
                buttonEl.click();
              }
            }}
          >
            {item}
          </li>
        );
      })}
    </ul>
  );
};
export default Dropdown;
