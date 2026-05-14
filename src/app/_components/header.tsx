"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/form";
import { useId } from "react";
import { PlusIcon } from "lucide-react";
import Dropdown, { type DropdownOption } from "@/components/dropdown";
import { useDialogs } from "@/components/dialog";
import styles from "./styles.module.scss";
import { useIPAuth } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
    { id: "create-project", label: "Create project" },
  ];
  const plusTriggerId = useId();

  const ipAuth = useIPAuth();
  const { data: sessionData } = authClient.useSession();
  const router = useRouter();

  return (
    <header className={styles.header}>
      <button id={plusTriggerId} className="align-center p-2">
        <PlusIcon />
      </button>
      <Dropdown
        style={{
          marginTop: "3.5rem",
        }}
        options={dropdownOptions}
        triggerId={plusTriggerId}
      />
      {ipAuth ? (
        <>
          <Button
            onClick={() => {
              if (!ipAuth) {
                return;
              }
              if (!sessionData) {
                openModal("LOGIN", {});
                return;
              }
              router.push("/admin");
            }}
            className={styles.admin}
          >
            Admin
          </Button>
        </>
      ) : null}
    </header>
  );
};
export default Header;
