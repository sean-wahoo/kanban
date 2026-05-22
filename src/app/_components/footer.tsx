"use client";

import styles from "./styles.module.scss";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <p>&copy; {currentYear} seanline.dev. MIT Licensed.</p>
    </footer>
  );
};
export default Footer;
