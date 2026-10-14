import styles from "./styles.module.scss";
import { KanbanLoading } from "@/app/_components/kanban";

const LoadingPage = () => {
  return (
    <main className={styles.main}>
      <KanbanLoading />
    </main>
  );
};

export default LoadingPage;
