# VoltDrop Pro - Progressive Web App

## Overview
VoltDrop Pro is a professional voltage drop calculator designed for electricians. It calculates voltage drop, verifies NEC 310.16 compliance, and generates PDF quotes with instant offline functionality.

## Recent Changes (November 17, 2025)
- ✅ Complete PWA implementation with service worker and offline support
- ✅ Yellow (#FFFF00) and black design theme throughout
- ✅ Real-time voltage drop calculation with automatic updates
- ✅ NEC 310.16 compliance checker (≤3% threshold)
- ✅ Wire gauge recommendation system for non-compliant scenarios
- ✅ PDF quote export with VoltDrop Pro branding
- ✅ Mobile-first responsive design
- ✅ PWA install prompt with offline indicator
- ✅ Comprehensive end-to-end testing completed

## Project Architecture

### Frontend (React + TypeScript)
- **Main Calculator:** `client/src/pages/calculator.tsx`
  - Voltage drop calculation engine
  - Real-time form validation and calculation
  - NEC compliance checker
  - PDF export functionality
  - Wire resistance tables for copper and aluminum (AWG 14 to 4/0)

- **PWA Hooks:** `client/src/hooks/use-pwa.ts`
  - Install prompt management
  - Online/offline detection
  - Service worker integration

### PWA Assets
- **Manifest:** `client/public/manifest.json`
  - App metadata and icons
  - Theme color: #FFFF00 (yellow)
  - Display mode: standalone

- **Service Worker:** `client/public/sw.js`
  - Offline caching strategy
  - Static asset caching
  - Runtime cache for dynamic resources

- **Icons:** Generated yellow lightning bolt on black background
  - 192x192 and 512x512 sizes

### Design System
- **Colors:** Yellow (#FFFF00) primary, black backgrounds, high contrast
- **Typography:** Inter for UI, JetBrains Mono for calculations
- **Theme:** Dark mode with yellow accents following design_guidelines.md

## Technical Features

### Voltage Drop Calculation
- **Single-Phase Formula:** VD = (2 × I × R × L) / 1000
- **Three-Phase Formula:** VD = (1.732 × I × R × L) / 1000
- **Variables:**
  - I = Current (Amps)
  - R = Wire resistance (ohms per 1000 ft)
  - L = Distance (feet)
  - VD% = (VD / System Voltage) × 100

### Wire Resistance Tables
Accurate resistance values from NEC Table 8 for all AWG sizes (14 to 4/0) in both copper and aluminum.

### NEC 310.16 Compliance
- ✅ PASS: Voltage drop ≤ 3%
- ❌ FAIL: Voltage drop > 3% (with automatic wire gauge recommendation)

### PDF Export
- Professional quote generation using jsPDF
- Includes all calculation parameters and results
- VoltDrop Pro branding
- NEC compliance status display

## User Journey
1. User enters: Amps, Distance, Voltage, Wire Size, Phase, Material
2. Results calculate automatically in real-time
3. NEC Pass/Fail badge displays instantly
4. If failing, recommended wire gauge shown
5. Export PDF quote with one click
6. Install as PWA for offline access

## Installation & Usage

### Development
```bash
npm run dev
```
App runs on http://localhost:5000

### PWA Installation
1. Open app in browser
2. Click "Install" on yellow bottom banner
3. App installs to home screen
4. Works fully offline after installation

### Testing
All core functionality tested via Playwright:
- ✅ Real-time calculation updates
- ✅ NEC Pass/Fail scenarios
- ✅ Wire gauge recommendations
- ✅ PDF export
- ✅ Phase and material switching
- ✅ Responsive design
- ✅ Visual styling verification

## Deployment
Ready for production deployment. Use the publish feature to deploy instantly with:
- Full PWA functionality
- Offline support
- Mobile-optimized experience
- Professional electrician tool

## Technical Stack
- **Frontend:** React 18, TypeScript, Wouter (routing)
- **UI:** shadcn/ui components, Tailwind CSS
- **PDF:** jsPDF library
- **PWA:** Service Worker API, Web App Manifest
- **Build:** Vite
- **Server:** Express.js (serves static PWA)

## Key Files
- `client/src/pages/calculator.tsx` - Main calculator component
- `client/src/hooks/use-pwa.ts` - PWA functionality
- `client/public/sw.js` - Service worker
- `client/public/manifest.json` - PWA manifest
- `design_guidelines.md` - Complete design specifications
- `tailwind.config.ts` - Theme configuration
- `client/src/index.css` - Yellow/black color tokens
