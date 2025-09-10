
# Alumni Management Platform Prototype

This is a code bundle for Alumni Management Platform Prototype. The original project is available at https://www.figma.com/design/kMMH73fbWXJtkXinZgCaog/Alumni-Management-Platform-Prototype.

## Features

- **Real MongoDB Integration**: Connected to MongoDB Atlas for persistent data storage
- **User Management**: Alumni, students, teachers, and admin users
- **Fundraising Platform**: Create and manage fundraising campaigns
- **Event Management**: Organize and track alumni events
- **Chat System**: Real-time messaging between alumni
- **Search & Discovery**: AI-powered search for alumni connections
- **Admin Dashboard**: Comprehensive platform analytics and management

## Database Configuration

The application uses MongoDB Atlas for data storage with the following connection:
- **Database**: `alumni_management`
- **Connection**: `mongodb+srv://starunkumarainls2024_db_user:2fgmUJliWHq9YUIl@cluster0.bc9ss4x.mongodb.net/`

### Collections

- `users` - Alumni, students, teachers, and admin users
- `fundraisers` - Fundraising campaigns and donations
- `events` - Alumni events and RSVPs
- `donations` - Payment records and transaction history
- `messages` - Chat messages between users
- `conversations` - Chat conversation threads

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_MONGODB_CONNECTION_STRING=mongodb+srv://starunkumarainds2024_db_user:2fgmUJliWHq9YUIl@cluster0.bc9ss4x.mongodb.net/
VITE_MONGODB_DATABASE_NAME=alumni_management
VITE_APP_NAME=Alumni Management Platform
VITE_APP_VERSION=1.0.0
```

## Running the code

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Database**: MongoDB Atlas
- **UI Components**: Radix UI, Lucide React Icons
- **Data Management**: Real-time MongoDB operations

## Default Login Credentials

### Admin Account
- Email: `admin@university.edu`
- Password: `admin123`

### Alumni Account
- Email: `john.doe@university.edu`
- Password: `password123`

## Data Storage

All application data is stored in MongoDB Atlas. No localStorage is used for persistent data - everything is saved to the cloud database including:

- User profiles and authentication
- Fundraising campaigns and donations
- Event information and RSVPs
- Chat messages and conversations
- Platform analytics and statistics  