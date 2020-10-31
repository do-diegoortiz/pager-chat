import React, { CSSProperties } from "react";

import styles from "./layout.module.css";

interface Props {
  children: JSX.Element[] | JSX.Element;
  customStyles: CSSProperties;
}

const ContainerBox: React.FC<Props> = ({ children, customStyles }) => {
  return (
    <div className={styles.container}>
      <div className={styles.loginBox} style={customStyles}>
        {children}
      </div>
    </div>
  );
};

export default ContainerBox;
