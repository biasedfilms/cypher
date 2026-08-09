# CYPHER

### An Interactive Cipher Machine

CYPHER is a browser-based cryptography visualization project inspired by historical rotor cipher machines.

Instead of simply displaying an encrypted result, CYPHER is designed to visualize the encryption process itself — from the input message, through the rotor system, to the final cipher output.

> Built with HTML, CSS, and Vanilla JavaScript.

** Live Demo

**[Open Cypher](https://biasedfilms.github.io/cypher/)**

---

## Overview

CYPHER was created as an exploration of how classical cryptography can be presented through an interactive and visual interface.

The project combines a rotor-based cipher system with a machine-inspired interface that allows users to configure the machine, observe its current state, and visualize the transformation of their message.

The goal is simple:

**Make cryptography something you can see and interact with.**

---

## Features

- Interactive message encryption and decryption
- Three configurable cipher rotors
- Adjustable rotor types
- Configurable starting rotor positions
- Animated signal path through the cipher machine
- Live rotor position tracking
- Real-time machine state
- Character processing progress
- Encryption and decryption controls
- Machine configuration reset
- Copyable cipher output
- Operation history
- Local browser storage for operation history
- Responsive interface
- Dark cinematic cryptography-inspired design

---

## How It Works

CYPHER processes a message through a sequence of configurable cipher components.

At a high level:

```text
INPUT
  │
  ▼
┌─────────┐
│ ROTOR I │
└────┬────┘
     │
     ▼
┌──────────┐
│ ROTOR II │
└────┬─────┘
     │
     ▼
┌───────────┐
│ ROTOR III │
└─────┬─────┘
      │
      ▼
    OUTPUT
```

Each rotor applies a character transformation based on its current configuration and position.

As characters are processed, the machine state changes and the interface visualizes the progression through the rotor assembly.

The exact implementation is designed for educational exploration rather than modern secure cryptographic use.

---

## Machine Configuration

CYPHER allows the machine to be configured before processing a message.

Each rotor can have:

- A selected rotor type
- A starting position
- A changing position as the machine processes characters

The current state of each rotor is displayed in the machine state panel.

This makes it possible to experiment with different configurations and observe how they affect the resulting ciphertext.

---

## Visualization

One of the main ideas behind CYPHER is that encryption should not feel like a black box.

During processing, the interface provides visual feedback for:

- The character currently being processed
- Rotor activity
- Rotor positions
- Processing progress
- Current operation
- Resulting ciphertext

The interface is intentionally designed to resemble a modern interpretation of a mechanical cipher machine.

---

## Operation History

CYPHER keeps a local record of completed operations.

The operation log can contain information such as:

- Operation type
- Input
- Output
- Machine configuration
- Timestamp

History is stored locally in the browser and does not require a backend database.

Users can clear the stored operation history from the interface.

---

## Technology

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Interface, layout, animations, and responsive design |
| Vanilla JavaScript | Cipher logic, machine state, interaction, and animation |
| Web Storage API | Local operation history |

CYPHER does not use a frontend framework.

No React, Vue, Angular, or other JavaScript framework is required.

---

## Project Structure

```text
cypher/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### `index.html`

Contains the structure of the CYPHER interface, including the input area, rotor assembly, machine configuration, live state, output, and operation history.

### `style.css`

Contains the visual design, responsive layout, animations, machine visualization, and color system.

### `script.js`

Contains the cipher logic, machine configuration, rotor state, encryption/decryption behavior, UI interactions, animations, and operation history.

---

## Running Locally

CYPHER is a client-side application and does not require a build process or package installation.

### 1. Clone the repository

```bash
git clone https://github.com/biasedfilms/cypher.git
cd cypher
```

### 2. Run the project

Open `index.html` directly in your browser, or use a local development server such as VS Code Live Server.

No additional dependencies are required.

---

## Design

CYPHER uses a dark, restrained visual language inspired by cryptographic machinery.

The interface combines:

- Deep charcoal surfaces
- Muted purple panels
- Metallic gold accents
- Pearl-white typography
- Monospaced technical labels
- Subtle mechanical animations
- High-contrast interface states

The intention is to make the application feel like a modern cryptographic instrument rather than a conventional web form.

---

## Limitations

CYPHER is an **educational and visualization project**.

It should **not** be used to protect sensitive information or as a replacement for modern cryptographic algorithms such as AES or ChaCha20.

The project is primarily intended to demonstrate:

- Classical cryptography concepts
- Cipher algorithms
- JavaScript programming
- State management
- DOM manipulation
- Animation
- Interactive UI design

---

## Future Improvements

Possible future improvements include:

- More rotor types
- Reflector implementation
- Plugboard configuration
- Additional classical ciphers
- Improved machine visualization
- More detailed signal tracing
- Preset machine configurations
- Expanded educational explanations
- Additional encryption modes

---

## Project Status

**Version 0.1 — Initial Release**

CYPHER is an actively developing project. The current version provides the core interactive cipher-machine experience, while additional functionality and refinements may be added in future releases.

---

## Author

**Mikael Kalesaran**

Informatics Engineering Student

---


<p align="center">
  <strong>CYPHER</strong>
  <br>
  <sub>An interactive exploration of classical cryptography.</sub>
</p>
