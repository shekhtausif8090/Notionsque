# Notionesque

A powerful task management application built with React, Redux, TypeScript, and Tailwind CSS. This application provides a comprehensive set of features for managing tasks with advanced capabilities similar to a simplified Notion.

## Features

### Multiple View Modes

* **List View**: Table format with sorting and pagination
* **Kanban View**: Drag-and-drop interface organized by priority

### Rich Task Management

* Create, edit, and delete tasks
* Set title, description, status, and priority
* Add custom fields for extended information
* View detailed task information

### Advanced Filtering & Sorting

* Filter by status and priority
* Search by task name
* Sort by any column in list view

### User-Friendly Interface

* Drag and drop tasks between priority columns
* Bulk selection and actions
* Responsive design for all screen sizes

### Data Persistence

* Automatic local storage saving
* 
## Tech Stack

* **React**: UI library for building the interface
* **TypeScript**: Static typing for better development experience
* **Redux Toolkit**: State management with advanced features
* **Redux-Persist**: Local storage persistence
* **@hello-pangea/dnd**: Drag-and-drop functionality
* **Tailwind CSS**: Utility-first CSS framework

## Getting Started

### Prerequisites

* Node.js (v14 or newer)
* npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/shekhtausif8090/Notionsque
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open your browser to http://localhost:5173

## Project Structure

```
src/
├── app/                    # Redux store setup and app hooks
├── components/             # UI components
│   ├── common/             # Reusable components
│   ├── layout/             # Layout components (Header)
│   ├── modals/             # Modal components (TaskModal)
│   ├── task/               # Task-related components (TaskDetailView)
│   └── views/              # Main views (ListView, KanbanView)
├── features/               # Redux Toolkit feature slices
│   ├── tasks/              # Tasks slice (CRUD operations)
│   └── ui/                 # UI state slice (view mode, filters, etc.)
├── types/                  # TypeScript type definitions
├── App.tsx                 # Main App component
└── main.tsx                # Entry point
```


