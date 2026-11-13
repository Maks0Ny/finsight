import { useEffect } from "react";
import { useNavigate } from "react-router";

import BrandImage from "../../../assets/brand/finsight-mark.svg";

import claudeImage from "../../../assets/agents/claude-color.svg";
import codexImage from "../../../assets/agents/codex-color.svg";
import geminiImage from "../../../assets/agents/gemini-color.svg";
import gemmaImage from "../../../assets/agents/gemma-color.svg";
import grokImage from "../../../assets/agents/grok.svg";
import ollamaImage from "../../../assets/agents/ollama.svg";
import openaiImage from "../../../assets/agents/openai.svg";
import perplexityImage from "../../../assets/agents/perplexity-color.svg";
import qwenImage from "../../../assets/agents/qwen-color.svg";

import styles from "./AboutPage.module.css";

export function AboutPage() {
  const navigate = useNavigate();

  function goBack() {
    navigate(-1);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        navigate(-1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return (
    <main className={styles.page}>
      <button
        className={styles.backButton}
        type="button"
        onClick={goBack}
      >
        <kbd>Esc</kbd>
      </button>

      <div className={`${styles.agent} ${styles.codex}`}>
        <img src={codexImage} alt="Codex" />
      </div>

      <div className={`${styles.agent} ${styles.claude}`}>
        <img src={claudeImage} alt="Claude" />
      </div>

      <div className={`${styles.agent} ${styles.openai}`}>
        <img src={openaiImage} alt="OpenAI" />
      </div>

      <div className={`${styles.agent} ${styles.gemini}`}>
        <img src={geminiImage} alt="Gemini" />
      </div>

      <div className={`${styles.agent} ${styles.grok}`}>
        <img src={grokImage} alt="Grok" />
      </div>

      <div className={`${styles.agent} ${styles.ollama}`}>
        <img src={ollamaImage} alt="Ollama" />
      </div>

      <div className={`${styles.agent} ${styles.gemma}`}>
        <img src={gemmaImage} alt="Gemma" />
      </div>

      <div className={`${styles.agent} ${styles.qwen}`}>
        <img src={qwenImage} alt="Qwen" />
      </div>

      <div className={`${styles.agent} ${styles.perplexity}`}>
        <img src={perplexityImage} alt="Perplexity" />
      </div>

      <section className={styles.author}>
        <img
            className = {styles.brandImage} 
            src = {BrandImage} 
            alt="BrandImage" />
        <span className={styles.label}>
          FinSight
        </span>

        <h1>Maksim Asandi</h1>

        <p>
          Brr brrr brruh
        </p>

        <time dateTime="2026-11-12">
          Проект создан 12.11.2026
        </time>
      </section>
    </main>
  );
}