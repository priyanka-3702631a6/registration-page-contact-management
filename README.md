# Registration Page with Contact Management

A web application that allows users to register contact information and manage contact records through a simple, user-friendly interface.

The project combines a Flask backend with a PostgreSQL database and a frontend built using HTML, CSS, and JavaScript.

## Features

- **Contact Registration:** Add contacts using first name, last name, email, and phone number.
- **Input Validation:** Validate required fields, email addresses, and phone numbers.
- **Database Integration:** Store contact information in PostgreSQL.
- **View Contacts:** Retrieve and display saved contacts in a table.
- **Search Contacts:** Search through the contact list.
- **Edit Contacts:** Update existing contact information.
- **Delete Contacts:** Remove contact records.
- **Error Handling:** Handle invalid inputs, duplicate email addresses, and database errors.
- **Responsive Interface:** Use the application on different screen sizes.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive layout |
| JavaScript | Frontend interactions and validation |
| Python | Backend programming |
| Flask | Backend web framework and API routes |
| PostgreSQL | Relational database |
| Psycopg | PostgreSQL database connectivity |
| python-dotenv | Load configuration from environment variables |
| Git and GitHub | Version control and source code hosting |

## Project Structure

```text
RegistrationPage/
│
├── backend/
│   └── app.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
├── .env
└── README.md
```

The `.env` file contains local configuration and should not be committed to GitHub.

## Prerequisites

Before running the application, install the following:

- Python
- pip
- PostgreSQL
- Visual Studio Code
- A modern web browser
- The Live Server extension for VS Code, or another local static web server

## Installation and Setup

### 1. Clone the repository

Open a terminal and run:

```bash
git clone https://github.com/priyanka-3702631a6/registration-page-contact-management.git
```

Navigate into the project directory:

```bash
cd registration-page-contact-management
```

### 2. Create and activate a virtual environment

Create the environment:

```bash
python -m venv venv
```

On Windows PowerShell, activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install the Python dependencies

With the virtual environment activated, run:

```bash
pip install Flask "psycopg[binary]" python-dotenv
```

### 4. Create the PostgreSQL database

Open PostgreSQL using pgAdmin or `psql`.

Create a database named:

```sql
CREATE DATABASE registration_db;
```

Connect to `registration_db` and create the contacts table:

```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL
);
```

If the table already exists, do not create it again.

### 5. Configure environment variables

Create a `.env` file in the project root, alongside `.gitignore`.

Add your own PostgreSQL configuration:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=registration_db
DB_USER=postgres
DB_PASSWORD=your_local_postgresql_password
```

Replace the example password with your own local PostgreSQL password.

**Security:** Never upload your actual `.env` file or share your database password publicly.

### 6. Start the Flask backend

From the project root, activate the virtual environment if necessary, then run:

```powershell
python backend/app.py
```

The backend is expected to run at:

```text
http://127.0.0.1:5000
```

Keep this terminal running while using the application.

### 7. Start the frontend

Open the `frontend` folder in VS Code.

Right-click `index.html` and select **Open with Live Server**.

The frontend will typically open at:

```text
http://127.0.0.1:5500
```

Keep the Flask backend running as well.

## API Endpoints

The Flask backend provides the following endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/test` | Test backend connectivity |
| GET | `/api/db-test` | Test database connectivity |
| POST | `/api/register` | Register a new contact |
| GET | `/api/contacts` | Retrieve contacts |
| PUT | `/api/contacts/<contact_id>` | Update a contact |
| DELETE | `/api/contacts/<contact_id>` | Delete a contact |

The registration endpoint validates contact information and handles duplicate email addresses.

## Future Improvements

- Add user authentication and authorization.
- Improve automated testing.
- Add pagination for larger contact lists.
- Improve deployment and production configuration.
- Add screenshots and further documentation.

## Author

**Priyanka**

GitHub: [priyanka-3702631a6](https://github.com/priyanka-3702631a6)

## License

No license has been specified yet.