import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.div}>
      <div className={styles.button}>
        <div className={styles.svg}>
          <img src="../image/mlzigba4-3ujldaf.svg" className={styles.frame} />
        </div>
        <p className={styles.inCio}>Início</p>
      </div>
      <div className={styles.button2}>
        <div className={styles.svg2}>
          <img src="../image/mlzigba4-4lpt2j0.svg" className={styles.frame2} />
        </div>
        <p className={styles.buscar}>Buscar</p>
      </div>
      <div className={styles.button3}>
        <div className={styles.svg3}>
          <img src="../image/mlzigba4-zp3z2ih.svg" className={styles.frame2} />
        </div>
        <p className={styles.cotar}>Cotar</p>
      </div>
      <div className={styles.button4}>
        <div className={styles.svg4}>
          <img src="../image/mlzigba5-n2lh69o.svg" className={styles.frame2} />
        </div>
        <p className={styles.favoritos}>Favoritos</p>
      </div>
      <div className={styles.button5}>
        <div className={styles.svg5}>
          <img src="../image/mlzigba5-f6cqqnu.svg" className={styles.frame3} />
        </div>
        <p className={styles.entrar}>Entrar</p>
      </div>
    </div>
  );
}

export default Component;
