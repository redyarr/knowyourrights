# Things to Remember: Running & Configuring the "Know Your Rights" Project

Here is a summary of the configuration fixes and runner setup implemented to launch the project successfully.

## 1. Concurrently Running Frontend & Backend
* **Issue**: The project is structured with separate `frontend` and `backend` folders, which requires opening separate terminal windows and running commands in each folder.
* **Solution**: Created a root `package.json` configured with `concurrently`. Now, both the Express backend and the Next.js frontend can be launched concurrently from the root directory using a single command:
  ```bash
  npm run dev
  ```

## 2. ImageKit.io Initialization Crash
* **Issue**: The backend Express server crashed on startup with `Error: Missing publicKey during ImageKit initialization` because the ImageKit library constructor validates keys on import.
* **Solution**: Added dummy ImageKit configuration placeholders in `backend/.env`. The constructor initializes successfully with these dummy credentials, allowing local execution without needing real, active keys:
  ```env
  IMAGEKIT_PUBLIC_KEY=placeholder_public_key
  IMAGEKIT_PRIVATE_KEY=placeholder_private_key
  IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/placeholder_id
  ```

## 3. Database Credentials Configuration
* **Issue**: Local database connections require correct credentials defined in the environment.
* **Solution**: Modified `backend/.env` to store the correct MySQL credentials:
  * Database Name: `knowyourrights`
  * Username: `root`
  * Password: `12123Redyar`
  * Host: `localhost`
* Prior to running, verified the database exists or created it using:
  ```sql
  CREATE DATABASE IF NOT EXISTS knowyourrights;
  ```

## 4. JWT Integration
* **Issue**: Token authentication in Next.js middleware and API routes expects a `JWT_SECRET`.
* **Solution**: Created `frontend/.env.local` containing the matching `JWT_SECRET` token (`your-secret-key-change-in-production`) to ensure client-side verification doesn't fail.

## 5. UI/UX Overhaul, Database Constraints, and Casing Bug Fixes
* **Sequelize Association Capitalization Bug**:
  * **Issue**: Sequelize maps associations like `User.hasOne(Lawyer)` in memory as `user.Lawyer` (capital L). Accessing `user.lawyer` prior to serialization returned `undefined`, causing the frontend Next.js application to think the lawyer's verification status was missing or pending.
  * **Solution**: Updated `authController.js` and registration/login functions to check `user?.Lawyer?.verificationStatus || user?.lawyer?.verificationStatus`.
* **Notification Column Constraint Constraint Failures**:
  * **Issue**: Creating database connections or accepting job applications failed with SQL constraint errors because `userId` (mapping to `user_id` column) was missing from the `Notification` model definition. Additionally, notification inserts were passing `type` instead of `title`, and missing junction table entries.
  * **Solution**: Added `userId` mapped to `user_id` in `backend/models/notification.js`. Updated `adminController.js` to use `title` and create `UserNotification` records during approvals.
* **Graceful AJAX Middleware Handling**:
  * **Issue**: When a pending/rejected lawyer accessed API routes, the `isVerifiedLawyer` middleware rendered EJS HTML templates, causing client-side Next.js JSON parser crashes.
  * **Solution**: Modified the middleware to check `Accept` headers or query parameters and return a clean JSON 403 status for AJAX/JSON requests.
* **Premium Next.js Frontend Modules**:
  * **Solution**: Built and styled fully functional premium pages for `/jobs` (with case creation, lawyer bidding, and hiring), `/messaging` (active chat with real-time polling), `/settings` (profile review, password update, and theme controls), `/help` (searchable FAQs and support forms), `/premium` (billing packages and secure mock checkout), and `/groups` (interest communities with join toggles).
* **Bypassing Database Migrations for UI Metadata**:
  * **Issue**: Global constraints prohibited executing automated migrations, but new UI features required additional attributes (like budget ranges and lawyer categories).
  * **Solution**: Serialized extra metadata inside free-form description text columns (e.g. using delimiters like `--- Category: X | Budget: Y ---`) which are parsed on the client.
* **UI Component Import Verification**:
  * **Issue**: Adding components (e.g. `Badge`, `Avatar`, `AvatarFallback`) without corresponding ES6 imports results in runtime React/Next.js failures that prevent compilation.
  * **Solution**: Always double-check and run local build checks or browser validations to verify every referenced UI block is fully defined.

## 6. Premium Responsive Overhauls & Layout Refactoring
* **Sign-In & Sign-Up Layout Flow**:
  * **Issue**: Standard form pages looked basic and lacked a modern tech-firm feel.
  * **Solution**: Rebuilt them with high-fidelity glass cards, custom gradients, dynamic role toggling between Regular Users and Attorneys, and clear validation highlights.
* **Global Navigation Header (Navbar)**:
  * **Issue**: Standard navbar alignments were off and didn't support proper mobile drawers or smooth page transition cues.
  * **Solution**: Styled a glassmorphic navbar with relative submenus, drop-down link alignments, custom avatars, and shadow layouts.
* **My Network & Cycle-Animation Suggested Lawyers**:
  * **Issue**: Suggestions lists was dry and static.
  * **Solution**: Added responsive sideboards, request filters (sent, received), and integrated Framer Motion cycle animations with exits and fade-in states to handle connections smoothly.
* **Dashboard Profile & Main Feed Feed**:
  * **Issue**: The dashboard and home feeds were cluttered and had basic text placeholders.
  * **Solution**: Overhauled them with cover banner edit options, unified tab switchers, license status display boxes, card layouts, and a dedicated timeline notification for pending lawyer verification.

## 7. Critical Missing Features & Responsiveness Fixes
* **Notifications System (Frontend)**:
  * **Issue**: Backend had `notificationController.js` with `getNotifications` and `markAsRead` endpoints but only rendered EJS templates. No frontend page existed, breaking the engagement loop entirely.
  * **Solution**: Added JSON API support by checking `Accept` header in the controller. Created `frontend/app/notifications/page.jsx` with All/Unread filters, mark-as-read on click, mark-all-read button, and contextual icons based on notification titles. Added `markAllAsRead` endpoint to the backend routes.
  * **Key Detail**: The JSON response maps `n.Notification?.title` and `n.Notification?.message` from the Sequelize include — capital "N" because Sequelize association names.
* **Notification Bell in Navbar**:
  * **Issue**: Users had no visibility into their notification count from anywhere in the app.
  * **Solution**: Added `unreadNotifCount` state with 30-second polling interval. Added Bell icon ("Alerts") to desktop nav items, mobile bottom nav, and mobile top header. Added notification link with unread count badge in the mobile sidebar drawer.
* **Footer Component**:
  * **Issue**: No footer existed anywhere in the app. For a legal platform this is a trust/compliance issue.
  * **Solution**: Created `frontend/components/Footer.jsx` with Platform/Legal/Community link columns, brand logo, copyright, and legal disclaimer. Integrated via `layout.js` using flexbox (`min-h-screen flex flex-col` + `flex-1` on main) to ensure footer stays at bottom.
* **Settings Mobile Responsiveness**:
  * **Issue**: Desktop vertical side tabs were too small to tap on mobile and stacked poorly.
  * **Solution**: Added a horizontally scrollable pill-button tab bar (`overflow-x-auto scrollbar-hide`) visible only on mobile (`md:hidden`), while hiding the desktop sidebar on mobile (`hidden md:block`). Added `.scrollbar-hide` utility to `globals.css`.
* **Global CSS Utilities Added**:
  * `.scrollbar-hide` — Hides scrollbars on horizontal scroll containers (Chrome + Firefox).
  * `.safe-area-bottom` — Adds `env(safe-area-inset-bottom)` padding for iOS safe area on fixed bottom navbars.
