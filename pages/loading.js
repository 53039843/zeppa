import React from 'react';
import { Helmet } from 'react-helmet'; // 引入 Helmet
import styles from '../styles/Loading.module.css';

const Loading = () => {
  return (
    // 使用一个 Fragment (<>) 来包裹所有元素
    <>
      {/* Helmet 组件用于管理文档头部信息 */}
      <Helmet>
        <title>微信运动刷步神器 - 专业的改步数平台</title>
        <meta name="description" content="微信运动刷步网站，在线修改步数，支持微信、支付宝，步数极速同步，修改稳定安全，助力步数轻松达标。" />
        <meta name="keywords" content="刷步,微信刷步,支付宝刷步,刷步神器,步数修改,步数同步,微信运动刷步" />
      </Helmet>

      {/* 你原来的组件内容 */}
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>加载中...</p>
        </div>
      </div>
    </>
  );
};

export default Loading;
