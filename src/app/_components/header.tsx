"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/form";
import { useId, useRef } from "react";
import { MenuIcon } from "lucide-react";
import Dropdown, { type DropdownOption } from "@/components/dropdown";
import { useDialogs } from "@/components/dialog";
import styles from "./styles.module.scss";
import { useIPAuth } from "@/lib/utils/client";
import Link from "next/link";

const Header = () => {
  const { openModal } = useDialogs();
  const dropdownOptions: DropdownOption[] = [
    {
      id: "create-task",
      item: "Create task",
      onClick: (e) => {
        e.preventDefault();
        openModal("CREATE_TASK", {});
      },
    },
    {
      id: "create-status",
      item: "Create status",
      onClick: (e) => {
        e.preventDefault();
        openModal("CREATE_STATUS", {});
      },
    },
    {
      id: "create-project",
      item: "Create project",
      onClick: (e) => {
        e.preventDefault();
        openModal("CREATE_PROJECT", {});
      },
    },
  ];
  const plusTriggerId = useId();

  const ipAuth = useIPAuth();
  const { data: sessionData } = authClient.useSession();
  const mobileNavTriggerId = useId();

  const navHeaderRef = useRef<HTMLUListElement>(null);
  const dropdownCreateRef = useRef<HTMLUListElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const createButton = (
    <button data-dropdown-trigger={plusTriggerId} ref={createButtonRef}>
      Create
    </button>
  );
  return (
    <header className={styles.header}>
      {sessionData?.user ? (
        <>
          <button
            data-dropdown-trigger={mobileNavTriggerId}
            className={styles.mobile_nav_trigger}
          >
            <MenuIcon />
          </button>
          <nav className={styles.header_nav}>
            {createButton}
            <Link href="#tasks">Tasks</Link>
            <Link href="#projects">Projects</Link>
          </nav>
          <Dropdown
            options={[
              {
                item: createButton,
              },
              { item: <Link href="#tasks">Tasks</Link> },
              { item: <Link href="#projects">Projects</Link> },
            ]}
            style={{
              marginTop: "3.5rem",
            }}
            triggerId={mobileNavTriggerId}
            ref={navHeaderRef}
          />
          <Dropdown
            style={{
              marginTop: "3.5rem",
            }}
            options={dropdownOptions}
            triggerId={plusTriggerId}
            triggerRef={createButtonRef}
            ref={dropdownCreateRef}
          />
        </>
      ) : null}

      {ipAuth ? (
        <>
          <Button
            onClick={async () => {
              if (!ipAuth) {
                return;
              }
              if (!sessionData) {
                openModal("LOGIN", {});
                return;
              }
              await authClient.signOut();
            }}
            className={styles.admin}
          >
            {!!sessionData ? "Logout" : "Login"}
          </Button>
        </>
      ) : null}
    </header>
  );
};
export default Header;
