# OgemboAdmin - Developer Portfolio Dashboard

A modern admin dashboard for managing Eugene Ogembo's developer portfolio content. This application allows the portfolio owner to create, update, delete, and manage portfolio content including projects, profile information, skills, education, and experience.

## Features

- **Dashboard**: Overview of portfolio statistics and quick actions
- **Profile Management**: Update personal and professional information
- **Project Management**: Create, edit, and delete portfolio projects
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React.js
- React Router for navigation
- React Icons for UI elements
- Axios for API requests (when integrated with backend)
- CSS for styling (custom styling system)

## Project Structure

```
src/
├── assets/
│   ├── icons/
│   └── images/
├── components/
│   ├── forms/
│   ├── layout/
│   ├── tables/
│   └── ui/
├── context/
├── hooks/
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── profile/
│   └── projects/
├── services/
│   └── api/
└── utils/
    ├── helpers/
    └── validation/
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/ogemboeugene/OgemboAdmin.git
cd OgemboAdmin
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Integration with Portfolio Website

This admin dashboard is designed to manage content for Eugene Ogembo's portfolio website. When connecting to the backend API:

1. Update API endpoint URLs in the `src/services/api/` directory
2. Configure authentication in the `src/context/` directory
3. Test the integration end-to-end

## Future Enhancements

- Authentication system with JWT
- Media library for image uploads
- Rich text editor for content creation
- Analytics dashboard
- Theme customization

## License

This project is private and intended for use by Eugene Ogembo.
