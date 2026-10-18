import listStyles from "../../styles.module.scss";
import styles from "../styles.module.scss";

const SKELETON_ROWS = 5;
const SKELETON_COLUMNS = 4;
const SKELETON_INFO_ITEMS = 3;
const SKELETON_CHIPS = 3;

export default function ProjectLoading() {
  return (
    <main className={listStyles.main}>
      <div className={listStyles.container}>
        <div className={styles.skeleton_back} />
        <div className={listStyles.toolbar}>
          <div className={styles.skeleton_title} />
          <span className={listStyles.lead_contents}>
            <span className={styles.skeleton_avatar} />
            <div className={styles.skeleton_name} />
          </span>
        </div>
        <div className={styles.details} aria-hidden="true">
          <div className={styles.skeleton_description}>
            <div className={styles.skeleton_text_line} />
            <div className={styles.skeleton_text_line} />
            <div className={styles.skeleton_text_line_short} />
          </div>
          <dl className={styles.info_grid}>
            {Array.from({ length: SKELETON_INFO_ITEMS }).map((_, i) => (
              <div key={`skeleton_info_${i}`} className={styles.info_item}>
                <dt className={styles.skeleton_info_label} />
                <dd className={styles.skeleton_info_value} />
              </div>
            ))}
          </dl>
          <div className={styles.chips}>
            {Array.from({ length: SKELETON_CHIPS }).map((_, i) => (
              <span key={`skeleton_chip_${i}`} className={styles.chip}>
                <span className={styles.skeleton_dot} />
                <span className={styles.skeleton_chip_line} />
              </span>
            ))}
          </div>
        </div>
        <div className={styles.skeleton_tasks_heading} />
        <div className={listStyles.skeleton}>
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
                <span className={listStyles.lead_contents}>
                  <span className={styles.skeleton_dot} />
                  <div className={styles.skeleton_name} />
                </span>
              </div>
              <div className={styles.skeleton_cell}>
                <span className={listStyles.lead_contents}>
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
