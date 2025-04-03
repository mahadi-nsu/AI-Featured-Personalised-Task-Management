# Task Management Application

A modern, feature-rich task management application built with Next.js and TypeScript, offering both list and kanban board views for efficient task organization.

## Features

### Task Management

- ✨ Create, edit, and delete tasks
- 📅 Date-based task organization (Today's Tasks and Tasks by Date)
- 🔄 Real-time status updates (Untouched, In Progress, Done)
- ⭐ Priority levels (High, Medium, Low)
- ⏱️ Estimated time tracking for tasks
- ⏰ Countdown timer for in-progress tasks
- 🔔 Sound notifications for tasks nearing completion
- 🔕 Mutable notifications with visual indicator

### AI-Powered Test Case Generation

- 🤖 Integration with Google's Gemini AI API
- 📝 Automatic test case generation from task descriptions
- 🎯 Comprehensive test scenarios including:
  - Positive test cases (Happy paths)
  - Negative test cases (Error handling)
  - Validation test cases
  - Edge cases
  - Security considerations
- 🔄 Real-time test status tracking:
  - Pass/Fail indicators
  - Inappropriate test marking
  - Visual status badges
- 📊 Structured test case format:
  - Unique test IDs
  - Detailed descriptions
  - Input data specifications
  - Expected results
- 🔗 Backend service built with Go:
  - RESTful API endpoints
  - Efficient request handling
  - Secure API integration

### User Interface

- 📱 Responsive design for all screen sizes
- 🎯 Drag and drop functionality for task reordering
- 📊 Dual view modes:
  - List view for simple task management
  - Kanban board for visual task organization
- 🌓 Dark/Light theme support
- 🔍 Advanced filtering and search capabilities:
  - Search by task title
  - Filter by status
  - Filter by priority

### Visual Feedback

- 🎨 Color-coded priorities and statuses
- ⚡ Visual feedback during drag and drop
- 🚨 Time-sensitive color indicators:
  - Warning state for tasks nearing deadline
  - Alert state for expired tasks
- 💫 Smooth transitions and animations

## Technology Stack

### Core Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework

### Backend Services

- **[Gemini AI Integration](https://github.com/mahadi-nsu/Gemini-Ai-Integration-golang)** - Go-based backend service for AI-powered test case generation
  - RESTful API endpoints
  - Google's Gemini AI integration
  - Efficient request handling
  - Secure API communication

### UI Components and Styling

- **shadcn/ui** - Reusable component system
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Modern icon system

### State Management and Utilities

- **React Hook Form** - Form handling
- **date-fns** - Date manipulation
- **dnd-kit** - Drag and drop functionality

### Rendering Method

- **Client-side Rendering** with React's useState and useEffect
- **Component-based Architecture** for modularity and reusability
- **Dynamic Imports** for optimized loading

## Project Structure

```
project/
├── app/
│   ├── layout.tsx       # Root layout with theme provider
│   └── page.tsx         # Main application page
├── components/
│   ├── ui/             # Reusable UI components
│   ├── todays-tasks.tsx # Today's tasks component
│   └── date-tasks.tsx   # Date-based tasks component
├── lib/
│   ├── utils.ts        # Utility functions
│   └── taskStorage.ts  # Task data management
└── public/
    └── notification.mp3 # Sound notification file
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Future Enhancements

- Backend integration
- User authentication
- Task sharing and collaboration
- Mobile application
- More advanced filtering options
- Task analytics and reporting

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
