# VoltDrop Pro - Design Guidelines

## Design Approach
**Reference-Based + Brand Identity Approach**: Industrial/professional calculator tool with bold yellow/black branding. Draw inspiration from Linear's clean utility interfaces and Stripe's calculator tools, but with high-contrast yellow/black aesthetic reminiscent of electrical safety signage and professional trade tools.

## Core Brand Identity
**Colors:**
- Primary Yellow: #FFFF00 (electric yellow)
- Primary Black: #000000
- Background: #0A0A0A (near-black for depth)
- Surface: #1A1A1A (elevated surfaces)
- Success: #10B981 (NEC Pass)
- Danger: #EF4444 (NEC Fail)
- Text on Yellow: #000000
- Text on Black: #FFFFFF
- Border/Divider: #333333

## Typography
**Font Stack:** 
- Headers: Inter, system-ui (Bold, 700-900 weights)
- Body: Inter, system-ui (Regular 400, Medium 500)
- Numbers/Results: JetBrains Mono, monospace (for calculator precision)

**Hierarchy:**
- App Title: text-3xl font-black (mobile), text-4xl (desktop)
- Section Headers: text-xl font-bold
- Input Labels: text-sm font-medium uppercase tracking-wide
- Result Values: text-4xl font-mono font-bold
- Body Text: text-base

## Layout System
**Spacing:** Use Tailwind units: 2, 4, 6, 8, 12, 16 for consistent rhythm
- Container padding: px-4 py-6 (mobile), px-6 py-8 (desktop)
- Section gaps: space-y-6 (mobile), space-y-8 (desktop)
- Card padding: p-6
- Form field spacing: space-y-4

**Grid Structure:**
- Mobile: Single column, full-width
- Tablet+: Max width 640px centered (calculator optimized)
- Form inputs: Full-width stacked
- Results grid: 2-column for metrics display

## Component Library

### App Header
- Fixed top bar with yellow background (#FF0)
- Black logo/title text with lightning bolt icon (⚡)
- Height: h-16
- Shadow: subtle drop shadow for depth
- "VoltDrop Pro" branding in top-right corner (text-sm font-medium)

### Calculator Card
- Dark surface (#1A1A1A) with yellow accent border (border-l-4 border-yellow-400)
- Rounded corners: rounded-xl
- Shadow: prominent shadow for elevation
- Padding: p-6 to p-8

### Form Inputs
**Input Fields:**
- Background: #0A0A0A
- Border: 2px solid #333333
- Focus state: border-yellow-400 with yellow glow
- Height: h-12
- Rounded: rounded-lg
- Text: text-white text-lg
- Label above input with required asterisk in yellow

**Dropdowns:**
- Same styling as inputs
- Custom yellow chevron indicator
- Dark dropdown menu with yellow hover states

**Radio Buttons (Phase/Material):**
- Horizontal button group layout
- Active: yellow background with black text
- Inactive: black background with white text
- Border: 2px solid yellow for group container

### Calculate Button
- Full-width on mobile
- Background: gradient from #FFFF00 to #FFD700
- Text: Black, text-lg font-bold uppercase tracking-wide
- Height: h-14
- Hover: subtle scale transform (scale-105)
- Active: slight press effect
- Icon: Lightning bolt before text

### Results Display
**Pass/Fail Indicator:**
- Large badge at top: rounded-full px-6 py-3
- Pass: Green background with white text
- Fail: Red background with white text
- Text: text-xl font-bold uppercase

**Metrics Grid:**
- 2-column grid on mobile (voltage drop V vs %)
- Dark cards with yellow accent
- Large numbers: text-4xl font-mono
- Label below: text-sm uppercase text-gray-400

**Recommendation Section (if fail):**
- Yellow alert box with black text
- Arrow icon pointing to recommended gauge
- Bold recommended wire size
- Background: rgba(255, 255, 0, 0.1) with yellow border

### Export Button
- Secondary style: Black background, yellow border (2px)
- Text: Yellow, font-medium
- Icon: PDF icon before text
- Height: h-12
- Position: Bottom of results section

### PWA Install Prompt
- Floating banner at bottom (only when installable)
- Yellow background with black text
- "Install VoltDrop Pro" with lightning icon
- Dismiss button in corner

## Mobile PWA Specifics
- Splash screen: Black background with yellow lightning bolt
- App icon: 512x512 yellow lightning bolt on black circle
- Theme color: #FFFF00 (yellow)
- Safe area padding for notched devices
- Bottom navigation sticky for quick calculate/export

## Animations
**Minimal & Purposeful:**
- Calculate button: 150ms scale transform on tap
- Results: Fade-in transition (300ms) when displayed
- Pass/Fail badge: Gentle pulse animation once on display
- NO scroll animations or excessive motion

## Accessibility
- High contrast yellow/black meets WCAG AAA
- Large touch targets (min 44x44px)
- Clear focus indicators (yellow glow)
- ARIA labels for all form inputs
- Screen reader announcements for calculation results

## Offline Indicator
- Small banner at top when offline
- Yellow background: "⚡ Offline Mode"
- Dismissible after 3 seconds