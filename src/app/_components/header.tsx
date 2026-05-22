"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/form";
import { useId, useRef } from "react";
import { MenuIcon, PlusIcon } from "lucide-react";
import Dropdown, { type DropdownOption } from "@/components/dropdown";
import { useDialogs } from "@/components/dialog";
import styles from "./styles.module.scss";
import { useIPAuth } from "@/lib/utils/client";
import Link from "next/link";
import { useMediaQuery, useMounted } from "@/lib/hooks";

const Header = () => {
  const { openModal } = useDialogs();
  const dropdownOptions: DropdownOption[] = [
    {
      id: "create-task",
      label: "Create task",
      onClick: (e) => {
        e.preventDefault();
        openModal("CREATE_TASK", {});
      },
    },
    {
      id: "create-status",
      label: "Create status",
      onClick: (e) => {
        e.preventDefault();
        openModal("CREATE_STATUS", {});
      },
    },
    {
      id: "create-project",
      label: "Create project",
      onClick: (e) => {
        e.preventDefault();
        openModal("CREATE_PROJECT", {});
      },
    },
  ];
  const plusTriggerId = useId();

  const ipAuth = useIPAuth();
  const { data: sessionData } = authClient.useSession();
  const mounted = useMounted();

  const navArea = (
    <nav className={styles.header_nav}>
      <button id={plusTriggerId}>
        <PlusIcon />
      </button>
      <Link href="#tasks">Tasks</Link>
      <Link href="#projects">Projects</Link>
    </nav>
  );
  const navOptions: DropdownOption[] = [
    {
      label: (
        <button id={plusTriggerId}>
          <PlusIcon />
        </button>
      ),
      onClick: () => {
        dropdownCreateRef.current?.showPopover();
      },
    },
    { label: <Link href="#tasks">Tasks</Link> },
    { label: <Link href="#projects">Projects</Link> },
  ];
  const isMobile = useMediaQuery("(max-width: 712px)");
  const mobileNavTriggerId = useId();

  const navHeaderRef = useRef<HTMLUListElement>(null);
  const dropdownCreateRef = useRef<HTMLUListElement>(null);
  return (
    <header className={styles.header}>
      <Dropdown
        style={{
          marginTop: "3.5rem",
        }}
        options={dropdownOptions}
        triggerId={plusTriggerId}
        ref={dropdownCreateRef}
      />
      {mounted && sessionData?.user ? (
        isMobile ? (
          <>
            <button id={mobileNavTriggerId}>
              <MenuIcon />
            </button>
            <Dropdown
              style={{ marginTop: "3.5rem" }}
              triggerId={mobileNavTriggerId}
              options={navOptions}
              ref={navHeaderRef}
            />
          </>
        ) : (
          navArea
        )
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
