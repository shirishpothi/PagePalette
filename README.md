# PagePalette

## Overview

**PagePalette** is a sustainable, customizable notebook system designed to bring personal expression to everyday study essentials. Inspired by Crocs jibbitz, our notebooks feature a unique modular front cover system that allows students to express their individuality through interchangeable, detachable modules.

This product is developed and marketed as part of a Junior Achievement (JA) entrepreneurship program, combining innovative product design with environmental consciousness and business acumen.

---

## The Product

### Core Concept

Traditional notebooks lack personalization and are often discarded entirely when pages run out. PagePalette addresses both issues through:

- **Refillable Binder Mechanism**: Replace only the paper, not the entire notebook
- **Customizable Front Cover**: Detachable modules (similar to Crocs jibbitz) for personal expression
- **Functional & Decorative**: Modules serve both aesthetic and academic purposes

### Product Offerings

| Item | Price Range | Description |
|------|-------------|-------------|
| **PagePalette Notebook** | $10 - $15 | Refillable binder notebook with modular front cover system |
| **Module Pack (5 units)** | $2 - $5 | Customer's choice of 5 modules from available designs |

### Module Types

Our modules go beyond simple decoration:

- **Fidget Modules**: Tactile elements for focus during study sessions
- **Whiteboard Modules**: Reusable writing surface for quick notes and calculations
- **CCA Patches**: Display your co-curricular activities and club affiliations
- **Decorative Modules**: Express your personality and style
- **Custom Designs**: Personalize your notebook to match your interests

---

## Sustainability Mission

PagePalette is committed to reducing environmental impact through sustainable design and materials:

### Environmental Challenges We Address

1. **Unsustainable Paper Sourcing**: Traditional notebooks rely on paper from potentially unsustainable sources
2. **Single-Use Plastics**: Conventional plastic covers are discarded after single use
3. **Complete Disposal**: Entire notebooks thrown away when only paper is consumed

### Our Solution

- **Binder System**: Refill paper instead of replacing entire notebooks, significantly reducing waste
- **Recycled Materials**: Front cover modules made from recycled plastics sourced from water bottles
- **Sustainable Sourcing**: Commitment to environmentally responsible material procurement
- **Longevity**: Durable design built for extended use across multiple academic terms

---

## Business Model

### Target Market

**Primary Audience**: Students (secondary school and beyond)

Our notebooks are designed for students who want to:
- Express individuality in their school supplies
- Stay organized with functional, reusable study tools
- Support sustainable practices
- Personalize their academic experience

### Revenue Strategy

**Primary Sales Channel**: Christmas Fair (~50 units projected)

**Revenue Streams**:
1. Initial notebook sales ($10-$15 per unit)
2. Module pack sales ($2-$5 per pack)
3. Repeat purchases of additional module packs

### Financial Structure

- **Pricing**: Currently being finalized with suppliers
- **Dividends**: Planned based on sales performance
- **Transparency**: Committed to clear financial communication with shareholders

---

## The Digital Platform

This repository contains the web application that serves as PagePalette's digital storefront and customization interface.

### Technical Architecture

**Technology Stack**:
- **Framework**: Next.js 16.0.5 (React 19.2.0)
- **Language**: TypeScript 5
- **3D Rendering**: Three.js (@react-three/fiber, @react-three/drei)
- **Animation**: Framer Motion 12
- **Styling**: Tailwind CSS 4 with custom animations

### Platform Features

1. **Interactive 3D Customizer**
   - Visualize notebook with module configurations
   - Real-time preview of module placements
   - STL file rendering for product prototyping

2. **Product Showcase**
   - Company mission and vision
   - Product features and benefits
   - Sustainability information

3. **Shareholder Updates**
   - Business development timeline
   - Company milestones and progress
   - Stakeholder engagement portal

---

## Installation & Setup

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun package manager

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/shirishpothi/PagePalette.git
   cd PagePalette
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server with hot-reload |
| `npm run build` | Builds the production-optimized application |
| `npm start` | Runs the production build |
| `npm run lint` | Executes ESLint for code quality validation |

---

## Project Structure

```
PagePalette/
├── app/                    # Next.js application directory
│   ├── customizer/        # 3D notebook customizer page
│   ├── updates/           # Shareholder updates page
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout component
├── components/            # Reusable React components
├── lib/                   # Utility functions and helpers
├── public/                # Static assets and images
├── *.stl                  # 3D model files for prototyping
└── output.json            # Application configuration schema
```

---

## Application Pages

### Home
Landing page showcasing the PagePalette product, mission, vision, and value proposition. Includes navigation to the 3D customizer and shareholder updates.

### 3D Customizer
Interactive interface allowing customers to:
- Visualize the notebook with different module configurations
- Preview module placements on the front cover
- Explore available module designs
- Understand product assembly and functionality

### Shareholder Updates
Progress dashboard displaying company development phases and milestones:

1. **Phase 1**: Formation & Ideation (Late Sept – Early Oct)
2. **Phase 2**: Market Validation & Branding (Mid-Oct)
3. **Phase 3**: Operations & Approvals (Late Oct – Nov)
4. **Phase 4**: Financial Structure & Capitalization (Nov)
5. **Phase 5**: Production Execution (Late Nov – Present)

---

## Deployment

### Production Build

```bash
npm run build
npm start
```

The application is optimized for deployment on modern hosting platforms with Next.js support.

---

## Development Guidelines

### Code Quality
All code must pass ESLint validation before committing:
```bash
npm run lint
```

### Component Architecture
- Maintain modular, reusable components
- Utilize TypeScript for type safety
- Follow React best practices

### Performance Optimization
- Leverage Next.js built-in optimizations
- Optimize 3D models for web delivery
- Implement code splitting for faster load times

---

## Company Timeline

### Development Phases

| Phase | Focus Area | Timeline |
|-------|------------|----------|
| Phase 1 | Formation & Ideation | Late Sept – Early Oct |
| Phase 2 | Market Validation & Branding | Mid-Oct |
| Phase 3 | Operations & Approvals | Late Oct – Nov |
| Phase 4 | Financial Structure & Capitalization | Nov |
| Phase 5 | Production Execution | Late Nov – Present |

---

## License

This project is private and proprietary. All rights reserved.

---

## Support

For inquiries about the product, investment opportunities, or technical questions, please contact the PagePalette team through designated communication channels.

---

## Acknowledgments

**PagePalette** is developed as part of the Junior Achievement entrepreneurship program.

Special thanks to:
- Nexus International School for program support
- Our suppliers and sustainability partners
- Junior Achievement Singapore for mentorship

**Built with**:
- [Next.js](https://nextjs.org) - Web framework
- [Three.js](https://threejs.org) - 3D visualization
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://www.framer.com/motion) - Animations

---

*Last Updated: November 2025*
