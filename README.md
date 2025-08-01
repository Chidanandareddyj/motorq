# MotorQ Parking Management System

This is a parking management system built with Next.js, Tailwind CSS, and Supabase. It allows for managing parking slots, vehicle entries and exits, day passes, and revenue tracking.

## Table of Contents

- [About The Project](#about-the-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [License](#license)

## About The Project

This project is a web application designed to streamline parking lot operations. Key features include:

*   **Dashboard:** An overview of parking occupancy and revenue.
*   **Vehicle Entry/Exit:** Record vehicle check-in and check-out times.
*   **Day Pass Management:** Issue and manage temporary day passes.
*   **Revenue Tracking:** Monitor revenue generated from parking fees.
*   **Parking Slot Management:** View the status of all parking slots.

## Demo

[Link to Video Demo]https://drive.google.com/file/d/12fhfy2hp4VogDQ--wcPEqXnSpnRgwrew/view?usp=sharing

## Built With

This project is built with the following technologies:

*   [Next.js](https://nextjs.org/) - React framework for production.
*   [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
*   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
*   [Supabase](https://supabase.io/) - The open source Firebase alternative.
*   [Shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.
*   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at Any Scale.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

You need to have Node.js and npm installed on your machine.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/Chidanandareddyj/motorq.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  You will need to set up a Supabase project and get the Project URL and anon key. Create a `.env.local` file in the root of the project and add the following environment variables:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

## Available Scripts

In the project directory, you can run:

| Script | Description |
| :--- | :--- |
| `npm run dev` | Runs the app in the development mode. |
| `npm run build` | Builds the app for production. |
| `npm run start` | Starts the production server. |
| `npm run lint` | Runs the linter. |

## Project Structure

The project structure is organized as follows:

```
.
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # API endpoints
│   ├── (pages)/          # Page components
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   └── ui/               # UI components from Shadcn
├── hooks/                # Custom React hooks
├── lib/                  # Library files (Supabase client, utils)
├── public/               # Static assets
└── ...                   # Configuration files
```
