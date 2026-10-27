
from flask import Flask, jsonify, request
from flask_cors import CORS
#Psycopg is the Python library that lets Flask communicate with PostgreSQL.
import psycopg 
import re
#Import python-dotenv
from dotenv import load_dotenv
import os

#This loads the settings from your .env file into your Python environment.
load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "registration_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD")
    )

@app.route("/")
def home():
    return "Registration Page backend is running!"


@app.route("/api/test")
def test_api():
    return jsonify({"message": "Frontend can connect to Flask!"})

# IMPORTANT: This endpoint accepts POST requests only.
# Opening /api/register directly in a browser sends a GET request by default,
# which results in 405 Method Not Allowed.
# Submitting the registration form sends a POST request via JavaScript.
# A 200 status code means the request was successful.

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    first_name = data.get("firstName", "").strip()
    last_name = data.get("lastName", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()

    if not all([first_name, last_name, email, phone]):
        return jsonify({"error": "All fields are required"}), 400

    # Validate email format.
    email_pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"

    if not re.fullmatch(email_pattern, email):
        return jsonify({
            "error": "Please enter a valid email address."
        }), 400

    # Validate phone number format.
    phone_pattern = r"\+?[0-9\s()\-]{7,20}"

    if not re.fullmatch(phone_pattern, phone):
        return jsonify({
            "error": "Please enter a valid phone number."
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO contacts
                        (first_name, last_name, email, phone)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (first_name, last_name, email, phone)
                )

                contact_id = cursor.fetchone()[0]

        return jsonify({
            "message": "Registration saved successfully!",
            "contactId": contact_id
        }), 201

    except psycopg.errors.UniqueViolation:
        return jsonify({
            "error": "This email address is already registered."
        }), 409

    except psycopg.Error:
        app.logger.exception("Database operation failed")
        return jsonify({
            "error": "Could not save registration. Please try again."
        }), 500


    

@app.route("/api/contacts", methods=["GET"])
def get_contacts():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, first_name, last_name, email, phone
                    FROM contacts
                    ORDER BY id DESC;
                """)

                rows = cursor.fetchall()

                contacts = [
                    {
                        "id": row[0],
                        "firstName": row[1],
                        "lastName": row[2],
                        "email": row[3],
                        "phone": row[4]
                    }
                    for row in rows
                ]

        return jsonify(contacts), 200

    except psycopg.Error:
        app.logger.exception("Could not retrieve contacts")
        return jsonify({
            "error": "Could not retrieve contacts. Please try again."
        }), 500


@app.route("/api/contacts/<int:contact_id>", methods=["DELETE"])
def delete_contact(contact_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM contacts
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (contact_id,)
                )

                deleted_contact = cursor.fetchone()

                if deleted_contact is None:
                    return jsonify({
                        "error": "Contact not found."
                    }), 404

        return jsonify({
            "message": "Contact deleted successfully!"
        }), 200

    except psycopg.Error:
        app.logger.exception("Could not delete contact")
        return jsonify({
            "error": "Could not delete contact. Please try again."
        }), 500



@app.route("/api/contacts/<int:contact_id>", methods=["PUT"])
def update_contact(contact_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    first_name = data.get("firstName", "").strip()
    last_name = data.get("lastName", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()

    if not all([first_name, last_name, email, phone]):
        return jsonify({"error": "All fields are required"}), 400

   
    # Validate email format.
    email_pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    
    if not re.fullmatch(email_pattern, email):
        return jsonify({
            "error": "Please enter a valid email address."
        }), 400
    
    # Validate phone number format.
    phone_pattern = r"\+?[0-9\s()\-]{7,20}"
    
    if not re.fullmatch(phone_pattern, phone):
        return jsonify({
            "error": "Please enter a valid phone number."
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE contacts
                    SET first_name = %s,
                        last_name = %s,
                        email = %s,
                        phone = %s
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (first_name, last_name, email, phone, contact_id)
                )

                updated_contact = cursor.fetchone()

                if updated_contact is None:
                    return jsonify({
                        "error": "Contact not found."
                    }), 404

        return jsonify({
            "message": "Contact updated successfully!",
            "contactId": updated_contact[0]
        }), 200

    except psycopg.errors.UniqueViolation:
        return jsonify({
            "error": "This email address is already registered."
        }), 409

    except psycopg.Error:
        app.logger.exception("Database operation failed")
        return jsonify({
            "error": "Could not update contact. Please try again."
        }), 500


@app.route("/api/db-test", methods=["GET"])
def test_database_connection():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()

        return jsonify({
            "message": "Flask connected to PostgreSQL successfully!"
        }), 200

    except psycopg.Error:
        app.logger.exception("Database connection failed")

        return jsonify({
            "error": "Could not connect to the database. Check the backend terminal."
        }), 500



if __name__ == "__main__":
    app.run(debug=True)
