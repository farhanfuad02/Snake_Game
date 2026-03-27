# 🐍 Snake Game — Neon Arcade

A classic Snake Game with a premium **neon arcade** dark theme, built with vanilla HTML, CSS, and JavaScript.

![Snake Game Screenshot](https://img.shields.io/badge/Made%20With-HTML%20%7C%20CSS%20%7C%20JS-00ff88?style=for-the-badge&labelColor=0a0a1a)

---

## ✨ Features

- 🎮 **3 Difficulty Levels** — Easy, Medium, and Hard
- ⌨️ **Keyboard Controls** — WASD or Arrow keys
- 📱 **Mobile Friendly** — On-screen D-pad + swipe gesture support
- ⭐ **Bonus Food** — Golden ★ food spawns every 50 points (worth 30 pts)
- 💥 **Particle Effects** — Burst animation when food is eaten
- 🏆 **High Score** — Persisted across sessions via `localStorage`
- ⏸️ **Pause/Resume** — Press `Space` to toggle
- 🌙 **Neon Dark Theme** — Glassmorphism cards, animated glows, and smooth transitions
- 📐 **Responsive Design** — Adapts to desktop, tablet, and mobile screens

---

## 🚀 Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Edge, Safari)

### Run the Game

1. **Clone or download** this repository
2. Open `index.html` in your browser
3. Click **START GAME** and enjoy!

> No build tools, frameworks, or dependencies required.

---

## 🎮 How to Play

| Action         | Keyboard        | Mobile           |
|----------------|-----------------|------------------|
| Move Up        | `W` or `↑`      | ▲ button / Swipe up |
| Move Down      | `S` or `↓`      | ▼ button / Swipe down |
| Move Left      | `A` or `←`      | ◄ button / Swipe left |
| Move Right     | `D` or `→`      | ► button / Swipe right |
| Pause / Resume | `Space`         | —                |

### Rules

- Eat the **pink food** to score **+10** points and grow longer
- Eat the **golden ★ bonus food** for **+30** points (appears every 50 pts, disappears after a short time)
- Avoid hitting **walls** or **your own body**
- Try to beat your **high score**!

---

## 📁 Project Structure

```
├── index.html   # Game layout, canvas, overlays, and controls
├── style.css    # Neon dark theme, animations, responsive styles
├── script.js    # Game engine: logic, rendering, input handling
└── README.md    # This file
```

---

## 🛠️ Built With

- **HTML5** — Semantic structure & Canvas API
- **CSS3** — Custom properties, glassmorphism, keyframe animations
- **JavaScript (ES6+)** — Game loop, collision detection, particle system

---

## 📜 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
