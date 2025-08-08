# Loan Management System

A simple loan tracking application built with **React** and bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

This app allows you to:
- Create loans for borrowers with **weekly** or **monthly** repayment schedules.
- Automatically calculate total payable amounts and per-installment amounts.
- Track repayments with a **payment history**.
- View repayment progress with a **progress bar**.
- Calculate **effective interest earned** based on actual repayment time.
- Search borrowers and manage loan records.

---

## 🛠 Features

### Loan Creation
- **Weekly Loans**:  
  Example: For ₹1000 over 6 months, total repayment = ₹1360  
  Weekly installment ≈ ₹60 (calculated dynamically).
- **Monthly Loans**:  
  Example: ₹1000 with 3% monthly interest → ₹30 per month interest.

### Loan Tracking
- Payment history with dates and amounts.
- Remaining balance auto-updated after each payment.
- Alerts for early payment attempts before the repayment start date.

### UI Enhancements
- Progress bar for repayment completion.
- Search bar to quickly find borrower records.
- Delete loan with confirmation dialog.

---

## 🚀 Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`
Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.  
The page will reload when you make changes.

#### `npm test`
Launches the test runner in interactive watch mode.

#### `npm run build`
Builds the app for production in the `build` folder.

#### `npm run eject`
**Warning:** This is a one-way operation. Once you eject, you can’t go back.

---

## 📚 Learn More

- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [Deployment Guide](https://facebook.github.io/create-react-app/docs/deployment)

---

## 📦 Deployment

You can deploy this project on:
- **Netlify**
- **Vercel**
- **GitHub Pages**

Refer to the [deployment guide](https://facebook.github.io/create-react-app/docs/deployment) for more details.

---

## 📝 License
This project is open source and available under the [MIT License](LICENSE).

