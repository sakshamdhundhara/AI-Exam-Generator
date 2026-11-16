"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
      </div>
      
      <main className={styles.main}>
        <motion.div 
          className={styles.glassCard}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            AI-Powered <span className={styles.highlight}>Exam Generator</span>
          </motion.h1>
          
          <motion.p 
            className={styles.description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Create comprehensive, perfectly balanced exam papers in seconds. 
            Powered by advanced AI agents that research, draft, review, and format 
            educational content tailored to your exact needs.
          </motion.p>
          
          <motion.div 
            className={styles.ctaGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Link href="/generate" className={styles.primaryButton}>
              Start Generating
            </Link>
            <Link href="/dashboard" className={styles.secondaryButton}>
              View Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
