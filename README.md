# 🌍 mDogo

<p align="center">
  <strong>Reconnecting fragments of history across the Atlantic</strong>
</p>

<p align="center">
  🧭 Explore • 📊 Learn • 🤝 Reconnect
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-MVP-blue" />
  <img src="https://img.shields.io/badge/backend-FastAPI-green" />
  <img src="https://img.shields.io/badge/frontend-React-blue" />
  <img src="https://img.shields.io/badge/license-GPLv3-lightgrey" />
  <img src="https://img.shields.io/badge/contributions-welcome-orange" />
</p>

---

**mDogo** (from Swahili, meaning something close to *brother* or *kin*) is an open, educational tool that helps people explore the historical links between Africa and the Americas.

This project uses historical data and probabilistic models to suggest **likely African regions of origin** based on known family history — without requiring DNA tests.

---

## ✨ Why mDogo exists

Millions of people across the Americas are descendants of those affected by the transatlantic slave trade.  
For many, the connection to their African origins was fragmented or lost.

**mDogo is an attempt to:**

- 🧭 Reconstruct possible origins using historical records  
- 📚 Educate through data and historical context  
- 🌐 Make knowledge accessible to everyone  
- 🤝 Foster awareness of shared heritage  

This is **not a genealogy replacement tool**, and it does not claim certainty.  
It is a **historical exploration tool** grounded in data and transparency.

---

## 🧠 How it works (in simple terms)

mDogo combines:

- 📊 Historical slave trade data (routes, regions, ports)
- 🗺️ Geographic information (countries, regions, cities)
- 🧩 Family history inputs (what the user already knows)
- 🧮 A probabilistic model (Bayesian inference)

Based on this, it estimates:

> “Given where your family is from, and what we know about historical movements, these African regions are more likely than others.”

The result is always a **probability distribution**, not a definitive answer.

---

## 🏗️ Architecture (high-level)

The system is intentionally simple and modular:

### Frontend
- Built with **React**
- Collects user input (location, ancestry clues, cultural tags)
- Displays results and explanations in a human-friendly way

### Backend
- Built with **FastAPI**
- Processes requests and runs the inference model
- Returns probabilities and narrative explanations

### Data Layer
- Historical datasets derived from academic sources
- Mappings between:
  - modern geography → colonial regions
  - colonial regions → African embarkation zones

### Inference Engine
- A lightweight **Bayesian model**
- Combines:
  - historical probabilities
  - geographic signals
  - cultural hints

---

## 🔍 Example

A user from the Pacific region of Colombia might see:

> “Based on historical records, people arriving in this region were most commonly brought from West Central Africa (Congo/Angola), followed by the Gold Coast and Bight of Benin.”

---

## 📚 Data & Methodology

mDogo is built on publicly available historical research, including data from:

- The Trans-Atlantic Slave Trade Database  
- Academic work in Atlantic history and African diaspora studies  

The methodology is intentionally transparent and will continue evolving.

---

## ⚠️ Important limitations

- This tool provides **probabilistic insights**, not exact ancestry
- Historical records are incomplete and sometimes biased
- Cultural identity cannot be reduced to data points

mDogo is meant to **support learning and reflection**, not replace lived identity or community knowledge.

---

## 🤝 Contributing

This project is open to contributions from:

- Developers
- Historians
- Genealogists
- Data scientists
- Anyone interested in the African diaspora

Ways to contribute:

- Improve mappings (geography, historical regions)
- Enhance the inference model
- Add datasets or documentation
- Improve UI/UX and accessibility

---

## 🚀 Vision

mDogo aims to become:

- A **bridge between data and history**
- A **tool for education and awareness**
- A **platform for collaboration across disciplines**

---

## 📌 Roadmap

- [ ] Expand geographic mappings (Africa ↔ Americas)
- [ ] Improve model accuracy with richer datasets
- [ ] Add historical narratives and explanations
- [ ] Support multiple languages
- [ ] Open dataset pipelines

---

## 📜 License

GNU GPL v3 License

---

## 📬 Contact

Feel free to open an issue or start a discussion on GitHub.

---
