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
import { ChevronDownIcon } from "lucide-react";
import { c, clickInRect } from "@/lib/utils";
import { ErrorBoundary } from "react-error-boundary";

export interface SelectOption {
  label: string;
  value: string;
  default?: boolean;
}
interface SelectProps extends ComponentProps<"div"> {
  options: SelectOption[];
  name?: string;
  ref?: RefObject<SelectInputHandle | null>;
  multiselect?: boolean;
  onValueChange?: (newVal: string[], oldVal: string[]) => void;
}

export interface SelectInputHandle extends HTMLDivElement {
  clear: () => void;
}

const Select = ({
  options,
  ref = createRef<SelectInputHandle>(),
  multiselect,
  onValueChange,
  ...props
}: SelectProps) => {
  const selectId = useId();
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);

  const selectOptionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleOptionSelect = useEffectEvent<MouseEventHandler<HTMLSpanElement>>(
    (e) => {
      const value = e.currentTarget.dataset.value as string;
      const oldOptions = selected;
      let newOptions = new Set<string>(selected);
      if (multiselect) {
        if (newOptions.has(value)) {
          newOptions.delete(value);
        } else {
          newOptions.add(value);
        }
        setSelected(Array.from(newOptions));
      } else {
        newOptions = new Set([value]);
      }

      setSelected([...newOptions]);
      onValueChange?.([...newOptions], oldOptions);
    },
  );

  const toggleOptions = useEffectEvent(() => {
    setShowOptions(!showOptions);
  });

  useEffect(() => {
    const closeOptsListener = (e: MouseEvent) => {
      if (selectOptionsRef.current && buttonRef.current) {
        if (
          !clickInRect(
            e.clientX,
            e.clientY,
            selectOptionsRef.current.getBoundingClientRect(),
          ) &&
          !clickInRect(
            e.clientX,
            e.clientY,
            buttonRef.current.getBoundingClientRect(),
          )
        ) {
          setShowOptions(false);
        }
      }
    };

    document.addEventListener("click", closeOptsListener);
    return () => document.removeEventListener("click", closeOptsListener);
  }, [selectId]);

  useEffect(() => {
    for (const opt of options) {
      if (opt.default) {
        setSelected([opt.value]);
      }
    }
  }, [options]);

  const selectRef = useRef<SelectInputHandle>(ref.current);

  useImperativeHandle(ref, () => ({
    ...ref.current!,
    clear: () => setSelected([]),
    getValue: () => selected,
  }));

  props.style = {
    ...props.style,
    anchorName: `--select-anchor-${selectId}`,
  };
  return (
    <ErrorBoundary fallback={<p>select error</p>}>
      <Suspense fallback={<p>select loading</p>}>
        <div {...props} className={styles.select} ref={selectRef} id={selectId}>
          <div className={styles.select_preview}>
            {multiselect ? (
              selected.map((sel) => (
                <span key={`${selectId}-sel-${sel}`}>
                  {options?.find((o) => o.value === sel)?.label}
                </span>
              ))
            ) : (
              <span>{options.find((o) => o.value === selected[0])?.label}</span>
            )}
            <button
              type="button"
              onClick={toggleOptions}
              ref={buttonRef}
              popoverTargetAction="toggle"
              popoverTarget={`${selectId}-opts`}
            >
              <ChevronDownIcon />
            </button>
          </div>
          <div
            id={`${selectId}-opts`}
            className={c(
              styles.select_options,
              showOptions ? styles.shown : null,
            )}
            popover="manual"
            ref={selectOptionsRef}
            style={{
              positionAnchor: `--select-anchor-${selectId}`,
            }}
          >
            {options.map((opt, i) => (
              <span
                key={`${selectId}-${opt.value}`}
                data-value={opt.value}
                onClick={handleOptionSelect}
                className={c(
                  styles.select_option,
                  selected.filter((s) => s) && selected.includes(opt.value)
                    ? styles.active
                    : null,
                )}
              >
                {opt.label}
              </span>
            ))}
          </div>
        </div>
        <input id={props.id} type="hidden" value={selected} name={props.name} />
      </Suspense>
    </ErrorBoundary>
  );
};
export default Select;
