"use client";
import NextForm from "next/form";
import styles from "./styles.module.scss";
import { ComponentProps } from "react";
import { c, Colors } from "@/lib/utils";

interface FormProps extends ComponentProps<typeof NextForm> {}
const Form = ({ children, className, ...props }: FormProps) => {
  return (
    <NextForm {...props} className={c(styles.form, className)}>
      {children}
    </NextForm>
  );
};
export default Form;

interface ButtonProps extends ComponentProps<"button"> {
  color?: keyof typeof Colors;
}
export const Button = ({ className, color, ...props }: ButtonProps) => {
  if (color) {
    props.style = {
      ...props.style,
      backgroundColor: Colors[color],
    };
  }
  return <button {...props} className={c(styles.button, className)} />;
};
