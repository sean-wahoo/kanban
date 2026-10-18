"use client";

import {
  ComponentProps,
  createRef,
  MouseEventHandler,
  RefObject,
  Suspense,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./styles.module.scss";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { c, clickInRect } from "@/lib/utils/client";
import { ErrorBoundary } from "react-error-boundary";

import { Select as BaseSelect } from "@base-ui/react";
import Spinner from "./spinner";

export interface SelectOption {
  label: string;
  value: string;
  default?: boolean;
}
interface SelectProps extends ComponentProps<"div"> {
  options: SelectOption[];
  name?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  loading?: boolean;
  ref?: RefObject<SelectInputHandle | null>;
  multiselect?: boolean;
  onValueChange?: (newVal: string[], oldVal: string[]) => void;
}

export interface SelectInputHandle extends HTMLDivElement {
  clear: () => void;
}

const Select = ({
  options,
  label,
  placeholder = "placeholder",
  name = "",
  loading = false,
  defaultValue = "",
  ...props
}: SelectProps) => {
  const [value, setValue] = useState<SelectOption | null>(
    options.find((o) => o.value === defaultValue) ?? null,
  );
  return (
    <div className={styles.select}>
      <BaseSelect.Root
        modal={false}
        name={name}
        items={options}
        value={value}
        onValueChange={setValue}
      >
        <div className={styles.select_preview}>
          {label ? (
            <BaseSelect.Label className={styles.select_label}>
              {label}
            </BaseSelect.Label>
          ) : null}
          <BaseSelect.Trigger
            className={c(
              loading ? styles.loading : null,
              styles.select_trigger,
            )}
            disabled={loading}
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                <BaseSelect.Value
                  className={styles.select_value}
                  placeholder={placeholder}
                />
                <BaseSelect.Icon>
                  <ChevronDownIcon size={16} />
                </BaseSelect.Icon>
              </>
            )}
          </BaseSelect.Trigger>
        </div>
        <BaseSelect.Portal>
          {/* <Select.Backdrop /> */}
          <BaseSelect.Positioner
            alignItemWithTrigger={false}
            sideOffset={2}
            className={styles.select_positioner}
          >
            <BaseSelect.Popup className={styles.select_popup}>
              {/* <Select.ScrollUpArrow /> */}
              <BaseSelect.ScrollUpArrow>
                <ChevronUpIcon />
              </BaseSelect.ScrollUpArrow>
              <BaseSelect.Arrow />
              <BaseSelect.List>
                {options.map((opt, i) => (
                  <BaseSelect.Item
                    key={`${opt.value}-${i}`}
                    value={opt.value}
                    className={styles.select_item}
                  >
                    {/* <BaseSelect.ItemIndicator> */}
                    {/*   <CheckIcon size={14} /> */}
                    {/* </BaseSelect.ItemIndicator> */}
                    <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
              <BaseSelect.ScrollDownArrow>
                <ChevronDownIcon />
              </BaseSelect.ScrollDownArrow>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
};

export default Select;
// export default OldSelect;
