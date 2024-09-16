

# Home Budgeting Application

A web-based application designed to help users manage their household expenses, track budgets, and analyze financial trends with graphical representations.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
  
---

## Features

- **Budget Tracking**: Add, edit, and delete budgeted expenses across various categories.
- **Expense Tracking**: Track actual expenses and compare them with budgeted amounts.
- **Graphs & Visualizations**: Visualize monthly and annual expenses with graphical representation.
- **Expense Management**: Add and edit individual expenses, and delete them with a confirmation dialog.
- **Journal & Credit Management**: Keep track of personal finance-related journal entries and manage credit cards.

---

## Technologies Used

### Frontend:

- **React**: JavaScript framework for building the user interface.
- **TailwindCSS**: For responsive and modern styling.
- **React Router**: For handling client-side routing.
- **Axios**: For making HTTP requests to the backend API.

### Backend:

- **Express.js**: Backend framework for building the API.
- **SQLite**: Lightweight database to store budget and expense information.
- **Node.js**: JavaScript runtime for the backend server.

---

## Installation

### Prerequisites:

- **Node.js** (>=14.x)
- **npm** or **yarn**

### Steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/home-budgeting-app.git
   cd home-budgeting-app
   ```

2. **Install dependencies for both frontend and backend**:

   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   # or
   yarn install

   # Install backend dependencies
   cd ../backend
   npm install
   # or
   yarn install
   ```

3. **Set up the database**:
   Ensure SQLite is properly configured. The application will automatically create tables upon starting the backend.

4. **Start the backend server**:

   ```bash
   cd backend
   npm start
   ```

   This will start the server on `http://localhost:5001`.

5. **Start the frontend server**:
   ```bash
   cd ../frontend
   npm start
   ```
   This will start the React application on `http://localhost:3000`.

---

## Usage

1. **Homepage**: View and edit budgeted expenses across various categories.
2. **Add Expense**: Manually add expenses to track actual spending.
3. **Monthly Expenses**: View a breakdown of actual vs. budgeted expenses.
4. **Journal**: Add personal finance-related notes and journal entries.
5. **Credit Card Management**: Manage and track credit card details.
6. **Graphs**: View graphical representations of monthly and annual expenses.

---

## API Endpoints

### Budgeted Expenses

- **GET** `/expenses`: Fetch all budgeted expenses.
- **POST** `/expenses`: Add or update budgeted expenses.

### Individual Expenses

- **GET** `/individual-expenses`: Fetch actual expenses.
- **POST** `/individual-expenses`: Add an actual expense.
- **PUT** `/individual-expenses/:id`: Edit an existing actual expense.
- **DELETE** `/individual-expenses/:id`: Delete an actual expense.

### Other Endpoints

- **/journal**: Manage journal entries.
- **/credit-cards**: Manage credit card data.

---

## Project Structure

```
home-budgeting-app/
│
├── frontend/         # React frontend
│   ├── src/          # Source code for the frontend
│   └── public/       # Static assets
│
├── backend/          # Express backend
│   ├── index.js      # Main backend server file
│   └── database.js   # Database connection and initialization
│
└── README.md         # This file
```

---

## Contributing

1. **Fork** the repository.
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "Added new feature"
   ```
4. **Push** to your forked repository:
   ```bash
   git push origin feature-name
   ```
5. Create a **Pull Request**.

---

## License

This project is licensed under the MIT License.

