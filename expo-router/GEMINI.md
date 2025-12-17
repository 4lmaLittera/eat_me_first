# Project Overview

This is an **Expo Router** project (likely a starter or prototype for "Eat Me First") built with **React Native**, **TypeScript**, and **Tamagui** for the UI. It utilizes the Expo SDK 54 and follows a file-based routing architecture.

## Tech Stack

*   **Framework:** [Expo](https://expo.dev/) (SDK 54)
*   **Routing:** [Expo Router](https://expo.github.io/router) (v6)
*   **UI Library:** [Tamagui](https://tamagui.dev/)
*   **Language:** TypeScript
*   **Package Manager:** Yarn
*   **Linting & Formatting:** [Biome](https://biomejs.dev/)

## Key Directories

*   `app/`: Contains the application's file-based routes and layouts.
    *   `_layout.tsx`: Root layout configuration.
    *   `(tabs)/`: Tab-based navigation structure.
*   `components/`: Reusable React components.
    *   `Provider.tsx`: Tamagui provider setup.
*   `assets/`: Static assets like fonts and images.
*   `.tamagui/`: Tamagui configuration files.

## specific Configuration Files

*   `app.json`: Expo project configuration (name: `expo-router-example`, slug: `expo-router-example`).
*   `tamagui.config.ts`: Main Tamagui configuration.
*   `biome.json`: Linter and formatter rules. Note strict rules like `"noConsoleLog": "error"`.
*   `babel.config.js`: Babel presets including Tamagui plugins.

## Development Workflow

### Installation

```bash
yarn install
```

### Running the App

*   **Start the development server:**
    ```bash
    yarn start
    ```
*   **Run on Android:**
    ```bash
    yarn android
    ```
*   **Run on iOS:**
    ```bash
    yarn ios
    ```
*   **Run on Web:**
    ```bash
    yarn web
    ```

### Tests

```bash
yarn test
```

### UI Maintenance

*   **Upgrade Tamagui:**
    ```bash
    yarn upgrade:tamagui
    ```
*   **Check Tamagui setup:**
    ```bash
    yarn check:tamagui
    ```

## Development Conventions

*   **Routing:** Uses Expo Router's file-based routing. Create files in `app/` to define new routes.
*   **Styling:** Use Tamagui components and the `useTheme` hook.
*   **Code Style:** Adheres to Biome configuration:
    *   Indent: 2 spaces
    *   Quotes: Single
    *   Semicolons: As needed
    *   **Important:** Avoid `console.log` in committed code (flagged as error).
*   **Fonts:** Custom fonts (Inter) are loaded in the root layout. Ensure fonts are loaded before rendering the main UI.
