# Happy Birthday, My Love | A Digital Love Scrapbook

A premium, romantic, interactive digital love scrapbook designed as a birthday surprise. The project consists of a high-fidelity web application (Next.js + Express) and a compiled, offline-capable Android application package (APK) wrapping the static frontend.

---

## 🌸 Key Features

* **Interactive Anniversary Counter**: Counts up the years, months, days, hours, and seconds spent together.
* **Romantic Timeline**: Chronologically tells the story of key milestones (First Meeting, Trips, Holidays) with animated cards.
* **Voice Note Player**: Plays recorded voice messages and sleepy midnight wishes.
* **Memory Gallery**: Displays images of special dates, travel, and events using a glassmorphic masonry layout.
* **Love Letters Envelope**: Interactive virtual envelope click-to-open letters.
* **Video Scrapbook**: Custom inline video playing of relationship snaps.
* **pastels Auroras & Floating Animations**: Features smooth cursor particle trails, floating WebGL pastel stars, and smooth gradients.
* **Offline APK Fallbacks**: Seamlessly acts as a serverless offline application when installed on Android, reading fallback stories, mock galleries, letters, and timelines locally.

---

## 🛠️ Project Structure

```
├── android-app/         # Native Android wrapper project (Kotlin + WebView)
│   ├── app/src/main/
│   │   ├── assets/out/  # Static Next.js compiled output assets folder
│   │   └── java/...     # MainActivity with custom offline interceptor
│   └── Birthday_Scrapbook.apk  # Re-compiled standalone Android APK
├── backend/             # Express.js REST API backend (Node.js)
│   ├── src/             # Express controllers, routes, and models
│   └── package.json
├── frontend/            # React + Next.js frontend website (TailwindCSS)
│   ├── src/             # Pages, Context providers, Components
│   └── package.json
├── run-website.cmd      # One-click startup script for development
└── README.md            # This file
```

---

## 🔐 Admin Dashboard Login Details

To access the administrator dashboard and manage content (add letters, memories, timeline events, etc.), navigate to:
`http://localhost:3000/login`

Default seeded credentials:
* **Username**: `admin`
* **Password**: `admin123`

---

## 🚀 How to Run the Web Application

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+) installed.
* SQLite (automatically set up and initialized as a local database file).

### Quick Start (One-Click Launch)
Double-click `run-website.cmd` in the root folder. This script will automatically:
1. Start the backend Express API on `http://localhost:5000`.
2. Start the frontend Next.js server on `http://localhost:3000`.

### Manual Start
If you prefer running them manually in separate shells:

**Backend Setup:**
```bash
cd backend
npm install
npm run dev
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📱 How to Build the Offline Android APK

The Android app packages the website to run 100% offline without any server connection.

### Prerequisites
* Java JDK 17 (available locally at `android-app/jdk/`).
* Android SDK (if compiling on a separate developer machine).

### Compilation Steps
1. **Export Static Website Assets**:
   Inside the `frontend/` directory, run the static export build script:
   ```bash
   cd frontend
   set STATIC_EXPORT=true
   npm run build
   ```
   This generates the static files in `frontend/out/`.

2. **Copy Assets to Android Project**:
   Copy all contents of `frontend/out/` into `android-app/app/src/main/assets/out/`.

3. **Build the APK**:
   Navigate to the `android-app` directory and use the Gradle wrapper:
   ```bash
   cd android-app
   set JAVA_HOME=jdk/jdk-17.0.11+9
   gradlew.bat assembleDebug
   ```
   The compiled APK file will be generated at:
   `android-app/app/build/outputs/apk/debug/app-debug.apk`

4. **Retrieve and Share**:
   A copy of the compiled app is kept at the root of this folder as **`Birthday_Scrapbook.apk`**.

---

## 💖 Customizations & Safe WebGL Rendering
* The APK uses a custom WebView client interceptor mapping root requests to local assets. It strips query strings and lowercase parameters to prevent load errors.
* Dynamic features like WebGL Galaxy trails and Splash Fluid cursor effects will auto-disable safely if WebGL is unsupported or disabled in the device's WebView, rendering the page elegantly on any budget smartphone.
