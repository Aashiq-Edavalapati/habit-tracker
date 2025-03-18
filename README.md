
# Score Your Daily Life - Gamifying Habit Tracking

## Overview
Turn everyday tasks into a game-like experience! "Score Your Daily Life" is a web app where users can track daily habits and earn points, levels, or rewards for completing them. The goal is to make habit tracking fun, engaging, and visually appealing.

## Features
- **Track Daily Habits**: Log habits and monitor progress over time.
- **Earn Rewards**: Collect points, badges, and maintain streaks for consistency.
- **Engaging UI**: Interactive elements make the experience enjoyable.

## Directory Structure
```
└── aashiq-edavalapati-habit-tracker/
    ├── README.md
    └── frontend/
        ├── README.md
        ├── eslint.config.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── vite.config.js
        ├── .gitignore
        ├── public/
        └── src/
            ├── App.css
            ├── App.jsx
            ├── index.css
            ├── main.jsx
            ├── assets/
            └── components/
                ├── CommandPalette.jsx
                ├── ContributionGrid.jsx
                ├── HabitPanel.jsx
                ├── QuickLogModal.jsx
                ├── StatsPanel.jsx
                └── CLIMode/
                    └── CLIMode.jsx
```

## Installation and Setup
Follow these steps to run the project locally:

### 1. Clone the Repository
```sh
git clone https://github.com/aashiq-edavalapati/habit-tracker.git
```

### 2. Navigate to the Project Directory
```sh
cd habit-tracker/frontend
```

### 3. Install Dependencies
Ensure you have Node.js installed, then run:
```sh
npm install
```

### 4. Start the Development Server
Run the following command to start the project:
```sh
npm run dev
```
The application will be available at `http://localhost:5173/` (or the port specified in Vite's output).
