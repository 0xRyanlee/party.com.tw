# Design Guidelines: Swiss International & Vibe Coding

This document outlines the visual design language for the project, inspired by **Swiss International Style**, **World App (Web3)**, and **Apple's iOS Design Guidelines**. The goal is a high-contrast, monochrome, highly legible, and "low-hallucination" interface that feels futuristic yet grounded.

## Core Principles

1.  **Monochrome Palette**: Rely almost exclusively on Black (#000000), White (#FFFFFF), and Grays. Color is used *only* for critical state changes (Success/Error) or very specific brand accents, but minimally.
2.  **Swiss International Style**:
    *   **Grid Systems**: Strict alignment and spacing.
    *   **Typography**: Sans-serif, bold headers, clear hierarchy. High legibility.
    *   **Minimalism**: Remove decoration. Form follows function.
3.  **Large Rounded Corners**:
    *   Cards, buttons, and modals feature aggressive corner rounding (`rounded-2xl` to `rounded-3xl` / 24px-32px).
    *   This creates a friendly, organic, and modern "soft tech" feel (similar to World App).
4.  **Low Hallucination / "Vibe Coding"**:
    *   Interfaces should be predictable and "calm".
    *   Avoid unnecessary gradients or complex shadows unless representing depth (glassmorphism).
    *   "What you see is what you get".

## Implementation Details

### Typography

*   **Font Family**: System Sans-Serif (SF Pro, Inter, Roboto).
*   **Weights**: Heavy contrast between headings (Bold/Black) and body (Regular/Medium).
*   **Tracking**: Slightly tighter tracking for large headings (`-0.02em` to `-0.04em`).

### Spacing & Layout

*   **Margins/Padding**: Generous whitespace.
*   **Container**: Centered, max-width constraints for readability.

### Components

#### Buttons
*   **Primary**: Solid Black (Light Mode) / Solid White (Dark Mode). Full pill shape or large radius (`rounded-full` or `rounded-2xl`).
*   **Secondary**: Gray background (e.g., `bg-gray-100` / `bg-zinc-800`).
*   **Ghost**: minimal text buttons with hover states.

#### Cards / Surfaces
*   **Background**: White or Off-White (Light Mode) / Black or Deep Gray (Dark Mode).
*   **Border**: Thin, subtle borders (`border-gray-200` / `border-zinc-800`).
*   **Radius**: `rounded-3xl` (24px) for main containers, `rounded-2xl` (16px) for nested items.
*   **Shadows**: Soft, diffused shadows for elevation, or flat with borders.

#### Input Fields
*   **Style**: Large hit areas, rounded corners (`rounded-xl` or `rounded-2xl`).
*   **State**: Clear focus rings (monochrome).

## Example Usage (Tailwind Classes)

*   **Card**: `bg-background border border-border rounded-3xl p-6`
*   **Primary Button**: `bg-primary text-primary-foreground rounded-full h-12 px-6 font-medium`
*   **Heading**: `text-4xl font-bold tracking-tight`

## Code Style for Vibe Coding

*   **Consistency**: Reuse `shadcn/ui` components but customize the `radius` and `variant` props to match the vibe.
*   **Simplicity**: Prefer composition over complex custom CSS.
*   **Clarity**: Variable names and component props should be self-explanatory.
