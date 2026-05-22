"use client";

import {
  ComponentProps,
  MouseEventHandler,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import styles from "./styles.module.scss";
import { c, clickInRect } from "@/lib/utils/client";
import { useMounted } from "@/lib/hooks";

export type DropdownOption = ComponentProps<"li"> &
  ComponentProps<"button"> & {
    label: React.ReactNode;
    value?: string;
    icon?: string;
  };
interface DropdownProps extends ComponentProps<"ul"> {
  options: DropdownOption[];
  triggerId: string;
  ref?: React.Ref<HTMLUListElement>;
}

const Dropdown = ({
  id,
  options,
  triggerId,
  className,
  ref: passedRef,
  ...props
}: DropdownProps) => {
  const dropdownId = useId();
  const dropdownRef = useRef<HTMLUListElement>(null);
  useImperativeHandle(passedRef, () => dropdownRef.current!, [dropdownRef]);

  const mounted = useMounted();
  useEffect(() => {
    const triggerElement = document.querySelector(
      `button#${triggerId}`,
    ) as HTMLButtonElement;
    console.log({ triggerElement });
    if (triggerElement && mounted) {
      triggerElement.popoverTargetElement = dropdownRef.current;
      triggerElement.popoverTargetAction = "toggle";
    }

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
  }, [triggerId, mounted]);

  return (
    <ul
      {...props}
      id={dropdownId}
      ref={dropdownRef}
      className={c(styles.dropdown, className)}
      popover="manual"
    >
      {options.map(({ icon, onClick, ...opt }, index) => {
        const itemOnClick: MouseEventHandler<HTMLLIElement> = (e) => {
          onClick?.(e);
          dropdownRef.current?.hidePopover();
        };
        const dataOptId = `dropdown-${dropdownId}-${opt.id ?? dropdownId + index}`;
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
