import styles from "./styles.module.scss";

const SKELETON_ROWS = 6;
const SKELETON_COLUMNS = 4;

export default function ProjectsLoading() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.skeleton_heading} />
          <div className={styles.skeleton_search}>
            <div className={styles.skeleton_input} />
          </div>
        </div>
        <div className={styles.skeleton} aria-hidden="true">
          <div className={styles.skeleton_row}>
            {Array.from({ length: SKELETON_COLUMNS }).map((_, i) => (
              <div key={`skeleton_header_${i}`} className={styles.skeleton_cell}>
                <div className={styles.skeleton_header_line} />
              </div>
            ))}
          </div>
          {Array.from({ length: SKELETON_ROWS }).map((_, r) => (
            <div key={`skeleton_row_${r}`} className={styles.skeleton_row}>
              <div className={styles.skeleton_cell_project}>
                <div className={styles.skeleton_line} />
                <div className={styles.skeleton_line_short} />
              </div>
              <div className={styles.skeleton_cell}>
                <div className={styles.skeleton_line} />
              </div>
              <div className={styles.skeleton_cell}>
                <span className={styles.lead_contents}>
                  <span className={styles.skeleton_avatar} />
                  <div className={styles.skeleton_name} />
                </span>
              </div>
              <div className={styles.skeleton_cell}>
                <div className={styles.skeleton_line} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
