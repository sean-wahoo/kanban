"use client";

import {
  ComponentProps,
  MouseEventHandler,
  useEffect,
  useId,
  useRef,
} from "react";
import styles from "./styles.module.scss";
import { c, clickInRect } from "@/lib/utils";

export type DropdownOption = ComponentProps<"li"> &
  ComponentProps<"button"> & {
    label: string;
    value?: string;
    icon?: string;
  };
interface DropdownProps extends ComponentProps<"ul"> {
  options: DropdownOption[];
  triggerId: string;
}

const Dropdown = ({
  id,
  options,
  triggerId,
  className,
  ...props
}: DropdownProps) => {
  const dropdownId = useId();
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const triggerElement = document.querySelector(
      `button#${triggerId}`,
    ) as HTMLButtonElement;
    triggerElement.popoverTargetElement = dropdownRef.current;
    triggerElement.popoverTargetAction = "toggle";

    const clickOutsideListener = (e: MouseEvent) => {
      if (dropdownRef.current) {
        if (
          !clickInRect(
            e.clientX,
            e.clientY,
            dropdownRef.current.getBoundingClientRect(),
          )
        ) {
          dropdownRef.current.hidePopover();
        }
      }
    };

    document.addEventListener("click", clickOutsideListener);
    return () => document.addEventListener("click", clickOutsideListener);
  }, [triggerId]);

  return (
    <ul
      {...props}
      id={dropdownId}
      ref={dropdownRef}
      className={c(styles.dropdown, className)}
      popover="manual"
    >
      {options.map(({ icon, onClick, ...opt }) => {
        const itemOnClick: MouseEventHandler<HTMLLIElement> = (e) => {
          onClick?.(e);
          dropdownRef.current?.hidePopover();
        };
        const dataOptId = `dropdown-${dropdownId}-${opt.id}`;
        return (
          <li
            {...opt}
            className={styles.option}
            key={dataOptId}
            data-opt-id={dataOptId}
            onClick={itemOnClick}
          >
            {opt.label}
          </li>
        );
      })}
    </ul>
  );
};
export default Dropdown;
