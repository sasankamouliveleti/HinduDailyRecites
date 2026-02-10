# Hindu Daily Recite

A React Native app for daily Hindu devotional recitations. Track your practice, build streaks, and stay consistent with your spiritual journey.

> **Vibe Coded** — This project was built entirely through vibe coding with [Claude Code](https://claude.ai/claude-code), Anthropic's AI coding assistant.

## What It Does

Hindu Daily Recite helps you maintain a daily devotional practice by providing a curated collection of sacred texts with progress tracking and streaks.

- **6 Sacred Texts** — Hanuman Chalisa, Lalitha Sahasranamam, Vishnu Sahasranamam, Aditya Hrudayam, Bhagavad Gita Ch. 12 & Ch. 15
- **Daily Tracking** — Mark recitations as complete and track your history
- **Streak System** — Global and per-recite streaks to keep you motivated
- **30-Day Calendar** — Visual heatmap of your practice over the last month
- **Multiple Text Modes** — View original Sanskrit/Telugu, English translation, or both
- **Daily Reminders** — Configurable push notifications so you never miss a day
- **Cloud Sync** — Sign in with Email or Google to sync data across devices (Firebase)
- **Offline First** — Works fully offline; syncs when connected

## Screenshots

<!-- Add your screenshots here -->
| Home | Library | Streaks | Settings |
|------|---------|---------|----------|
| ![Home](screenshots/home.png) | ![Library](screenshots/library.png) | ![Streaks](screenshots/streaks.png) | ![Settings](screenshots/settings.png) |

| Recite Detail | Auth |
|---------------|------|
| ![Detail](screenshots/detail.png) | ![Auth](screenshots/auth.png) |

## Tech Stack

- **React Native** with Expo SDK 54 (managed workflow)
- **TypeScript**
- **Firebase** — Authentication (Email/Password + Google) & Cloud Firestore
- **AsyncStorage** — Local persistence (offline-first)
- **React Navigation** — Bottom tabs + stack navigation
- **Reanimated** — Smooth animations and transitions
- **Expo Notifications** — Daily reminder scheduling

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start
```

### Firebase Setup (for cloud sync)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password and Google authentication
3. Create a Firestore database
4. Copy your config into `src/config/firebase.ts`

### Build for iOS

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
```

## Project Structure

```
src/
├── components/    UI components (AudioPlayer, ReciteCard, ProgressRing, StreakCounter)
├── config/        Firebase configuration
├── contexts/      AuthContext, StreaksContext (shared state)
├── data/          Recite content and metadata
├── hooks/         useAuth, useStreaks, useAudio, useNotifications
├── navigation/    Bottom tabs + stack navigator
├── screens/       Home, Library, ReciteDetail, Streaks, Settings, Auth
├── services/      Storage, cloud sync, streaks logic, notifications
├── theme/         Colors, spacing, typography
└── types/         TypeScript interfaces
```

## License

MIT
