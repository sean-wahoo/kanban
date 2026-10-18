"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/form";
import { useActionState, useId, useRef } from "react";
import { MenuIcon, UserIcon } from "lucide-react";
import Dropdown, { type DropdownOption } from "@/components/dropdown";
import styles from "./styles.module.scss";
import { useIPAuth } from "@/lib/utils/client";
import Link from "next/link";
import Image from "next/image";

import { Dialog, Form, Fieldset, Field, Input, Menu } from "@base-ui/react";
import Select, { SelectInputHandle } from "@/components/select";
import { createTask } from "@/server/actions";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  CreateProjectDialog,
  CreateTaskDialog,
  LoginDialog,
} from "@/components/dialogs";

const Header = () => {
  const createTaskDialogHandle = Dialog.createHandle<HTMLElement>();
  const createProjectDialogHandle = Dialog.createHandle<HTMLElement>();
  const loginDialogHandle = Dialog.createHandle<HTMLElement>();
  const dropdownOptions: DropdownOption[] = [
    {
      id: "create-task",
      item: "Task",
      onClick: (e) => {
        e.preventDefault();
        createTaskDialogHandle.open(null);
      },
    },
    {
      id: "create-project",
      item: "Project",
      onClick: (e) => {
        e.preventDefault();
        createProjectDialogHandle.open(null);
      },
    },
  ];
  const plusTriggerId = useId();

  const ipAuth = useIPAuth();
  const { data: sessionData, isPending } = authClient.useSession();
  const mobileNavTriggerId = useId();

  const authDropdownTriggerId = useId();

  const navHeaderRef = useRef<HTMLUListElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const newMenuHandle = Menu.createHandle<HTMLElement>();
  const authMenuHandle = Menu.createHandle<HTMLElement>();
  // const newButton = (
  // );

  // const createTaskHandle = Menu.createHandle<HTMLElement>();
  // const createProjectHandle = Menu.createHandle<HTMLElement>();
  // const loginHandle = Menu.createHandle<HTMLElement>();

  return (
    <>
      <CreateTaskDialog handle={createTaskDialogHandle} />
      <CreateProjectDialog handle={createProjectDialogHandle} />
      <LoginDialog handle={loginDialogHandle} />
      <header className={styles.header}>
        <Link href="/">
          <Image src="/kanban_logo.svg" width={48} height={48} alt="" />
        </Link>
        {!isPending && sessionData?.user ? (
          <>
            <nav className={styles.header_nav}>
              <Link href="/projects">Projects</Link>
              <span className={styles.divider} tabIndex={-1} />
              <Menu.Trigger
                handle={newMenuHandle}
                className={styles.new_button}
                ref={createButtonRef}
              >
                + New
              </Menu.Trigger>
              {/* {createButton} */}
              {/* <Link href="#tasks">Tasks</Link> */}
              {/* <Link href="#projects">Projects</Link> */}
            </nav>
            <Dropdown
              options={[
                { item: <Link href="#tasks">Tasks</Link> },
                { item: <Link href="/projects">Projects</Link> },
              ]}
              style={{
                marginTop: "3.5rem",
              }}
              // triggerId={mobileNavTriggerId}
              ref={navHeaderRef}
            />
            <Dropdown
              style={{
                marginTop: "3.5rem",
              }}
              options={dropdownOptions}
              handle={newMenuHandle}
              // triggerId={plusTriggerId}
              // triggerRef={createButtonRef}
              // ref={dropdownCreateRef}
            />
          </>
        ) : null}

        {ipAuth ? (
          <>
            <Menu.Trigger
              // onClick={async () => {
              //   if (!ipAuth) {
              //     return;
              //   }
              //   if (!sessionData) {
              //     loginDialogHandle.open("login");
              //     return;
              //   }
              //   await authClient.signOut();
              // }}
              handle={authMenuHandle}

              className={styles.admin}
            >
              <UserIcon />
              {/* {!!sessionData ? "Logout" : "Login"} */}
            </Menu.Trigger>
            <Dropdown
              options={[
                !!sessionData
                  ? { item: "Logout", onClick: () => authClient.signOut() }
                  : {
                      item: "Login",
                      onClick: () => loginDialogHandle.open("login"),
                    },
              ]}
              handle={authMenuHandle}
              style={{
                marginTop: "3.5rem",
              }}
            />
          </>
        ) : null}
      </header>
    </>
  );
};
export default Header;
