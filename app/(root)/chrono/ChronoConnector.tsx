import styles from "./chrono.module.css";

export default function ChronoConnector({ descending }: { descending: boolean }) {
  return (
    <div className={styles.connector} aria-hidden="true">
      <svg viewBox="0 0 32 72" preserveAspectRatio="none" fill="none">
        <path d={descending ? "M0 4 H16 V68 H32" : "M0 68 H16 V4 H32"} stroke="#f8717166" />
      </svg>
    </div>
  );
}
