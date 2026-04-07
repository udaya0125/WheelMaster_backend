# Wheel Master Driving Booking System
Professional driving lesson booking and management platform for a modern driving school.

## Project Overview
Wheel Master Driving Booking System is a full-stack web application built to streamline how a driving school presents services, manages bookings, and handles customer reservations.

The platform supports a practical end-to-end booking workflow: customers can browse driving packages, submit reservation details, and receive confirmation updates, while administrators can manage bookings, availability, time slots, testimonials, blogs, gallery content, and user records from a central dashboard.

This project is designed to improve both the customer experience and the operational workflow of a driving school. It reduces manual coordination, provides a more structured reservation process, and delivers a clean, responsive interface that works well across desktop and mobile devices.

## Live Demo
- Live site: https://booking.wheelmasterdriving.com.au/

## Key Features
- Lesson booking flow with structured reservation submission
- Service and package selection for different driving lesson options
- Availability and time-slot handling for scheduling control
- Booking confirmation and status update workflow
- Customer information collection with validation-aware forms
- Responsive interface optimized for mobile and desktop use
- Admin management screens for reservations, time slots, users, and content
- Support for blocking unavailable dates or periods
- Notification flow for reservation events and updates
- Clear error handling and user feedback during form submission

## Tech Stack
- Frontend: React, Inertia.js, Vite
- Backend: Laravel, PHP, Laravel Breeze
- Styling: Tailwind CSS
- Forms and HTTP: Axios
- Database: MySQL
- Routing: Laravel routes with Inertia page rendering
- Deployment / Hosting: Production web hosting at `booking.wheelmasterdriving.com.au`

## Screens / Modules
- Home / Landing
- Booking Form
- Service Selection / Price Packages
- Contact / Inquiry
- Calendar Booking / Availability Management
- Admin Dashboard
- User Reservation Management
- Time Slot Management
- Gallery
- Blog
- Testimonials
- Confirmation / Success Flow

## Why This Project Stands Out
This project is strong because it solves a real business problem rather than demonstrating isolated UI components.

- Business-focused design built around booking conversion and operational efficiency
- Real-world usability for customers, staff, and administrators
- Maintainable Laravel + React architecture with clearly separated responsibilities
- Scalable structure that can support new packages, booking rules, and content modules
- Modern UI and responsive behavior suitable for a public-facing service platform
- Practical implementation of scheduling, reservation state, and admin workflows

## Project Goals
- Simplify the lesson booking process for customers
- Reduce manual booking coordination for the driving school
- Provide a reliable system for managing availability and reservations
- Present services in a professional and easy-to-navigate format
- Support a polished digital presence that builds trust with prospective learners

## Installation
```bash
git clone <repo-url>
cd project-name
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run dev
php artisan serve
```

## Environment Setup
Update your `.env` file with the required application and database settings before running migrations.

Typical values include:
- `APP_NAME`
- `APP_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

## Notes
- The application uses Inertia.js to connect Laravel routes with React pages.
- Booking-related flows are supported by reservation, time slot, and block management modules.
- The admin area includes content management capabilities for the driving school website.

## License
This project is licensed under the MIT License. See the `LICENSE` file if one is present in the repository, or add one to make the terms explicit for reuse and distribution.
