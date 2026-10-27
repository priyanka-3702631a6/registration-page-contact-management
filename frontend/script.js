
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");

let editingContactId = null;

const searchInput = document.getElementById("searchInput");
const clearSearchButton = document.getElementById("clearSearchButton");

const registrationForm = document.getElementById("registrationForm");

const formMessage = document.getElementById("formMessage");

// Display a message on the page.
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = type;
}
function clearMessage() {
    formMessage.textContent = "";
    formMessage.className = "";
}
//when a user starts entering new information, the previous success or error message will disappear.
registrationForm.addEventListener("input", clearMessage);

registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim()
    };

    //checks that none of the four values is empty before sending the request.
    if (!Object.values(formData).every(value => value !== "")) {
        alert("Please fill in all fields.");
        return;
    }

    // Validate email format.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Validate phone number.
    const phonePattern = /^\+?[0-9\s()-]{7,20}$/;

    if (!phonePattern.test(formData.phone)) {
        alert("Please enter a valid phone number.");
        return;
    }

    try {

        //condition determines which request to send:
        const url = editingContactId === null
            ? "http://127.0.0.1:5000/api/register"
            : `http://127.0.0.1:5000/api/contacts/${editingContactId}`;

        const method = editingContactId === null ? "POST" : "PUT";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });


        const data = await response.json();

        if (!response.ok) {
            //409 means a conflict, which your backend uses for duplicate email addresses.
            if (response.status === 409) {
                throw new Error("This email address is already registered.");
            }
            //400 indicates invalid input,
            if (response.status === 400) {
                throw new Error(data.error || "Please check the information entered.");
            }

            //500 indicates a server-side failure.
            if (response.status >= 500) {
                throw new Error("Server or database error. Please try again later.");
            }

            throw new Error(data.error || "Registration failed. Please try again.");
        }

        showMessage(data.message, "success");
        console.log("Registration response:", data);

        //Clears the fields after a successful registration, making the form ready for another contact.
        registrationForm.reset();

        //Reset the form after a successful update
        editingContactId = null;
        submitButton.textContent = "Register";
        cancelEditButton.hidden = true;

        await loadContacts();

    } catch (error) {
        console.error("Registration error:", error);

        if (error instanceof TypeError) {
            showMessage(
                "Cannot connect to the server. Please check whether Flask is running.",
                "error"
            );
        } else {
            showMessage(error.message, "error");
        }
    }
});



async function testBackendConnection() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/test");

        if (!response.ok) {
            throw new Error("Backend request failed");
        }

        const data = await response.json();
        console.log("Backend response:", data);
    } catch (error) {
        console.error("Connection error:", error);
    }
}

testBackendConnection();


async function loadContacts() {
    const contactsTableBody = document.getElementById("contactsTableBody");
    const contactsMessage = document.getElementById("contactsMessage");

    try {
        const response = await fetch("http://127.0.0.1:5000/api/contacts");
        const contacts = await response.json();

        if (!response.ok) {
            throw new Error(contacts.error || "Could not load contacts.");
        }

        contactsTableBody.innerHTML = "";

        if (contacts.length === 0) {
            contactsMessage.textContent = "No contacts registered yet.";
            return;
        }

        contactsMessage.textContent = "";

        contacts.forEach(function (contact) {
            const row = document.createElement("tr");


            [
                contact.id,
                contact.firstName,
                contact.lastName,
                contact.email,
                contact.phone
            ].forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            // Create the Action cell.
            const actionCell = document.createElement("td");

            // Create the Delete button.
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.type = "button";


            // Create the Edit button.
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.type = "button";

            // Fill the registration form with the selected contact's details.
            editButton.addEventListener("click", function () {
                document.getElementById("firstName").value = contact.firstName;
                document.getElementById("lastName").value = contact.lastName;
                document.getElementById("email").value = contact.email;
                document.getElementById("phone").value = contact.phone;

                editingContactId = contact.id;

                submitButton.textContent = "Update Contact";
                cancelEditButton.hidden = false;
            });


            // Delete the selected contact when clicked.
            deleteButton.addEventListener("click", async function () {
                const confirmed = confirm(
                    `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`
                );

                if (!confirmed) {
                    return;
                }

                try {
                    const deleteResponse = await fetch(
                        `http://127.0.0.1:5000/api/contacts/${contact.id}`,
                        {
                            method: "DELETE"
                        }
                    );

                    const deleteData = await deleteResponse.json();

                    if (!deleteResponse.ok) {
                        throw new Error(
                            deleteData.error || "Could not delete contact."
                        );
                    }

                    alert(deleteData.message);

                    // Reload the table from PostgreSQL.
                    await loadContacts();

                } catch (error) {
                    console.error("Delete error:", error);
                    alert(error.message);
                }
            });

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);

            contactsTableBody.appendChild(row);

        });

    } catch (error) {
        console.error("Error loading contacts:", error);
        contactsMessage.textContent =
            "Could not load contacts. Please check whether Flask is running.";
    }
}

//Make Cancel Edit work
cancelEditButton.addEventListener("click", function () {
    registrationForm.reset();

    editingContactId = null;
    submitButton.textContent = "Register";
    cancelEditButton.hidden = true;
});

searchInput.addEventListener("input", function () {
    const searchText = searchInput.value.trim().toLowerCase();
    const contactRows = document.querySelectorAll("#contactsTableBody tr");

    contactRows.forEach(function (row) {
        const rowText = row.textContent.toLowerCase();

        if (rowText.includes(searchText)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});

clearSearchButton.addEventListener("click", function () {
    searchInput.value = "";

    const contactRows = document.querySelectorAll("#contactsTableBody tr");

    contactRows.forEach(function (row) {
        row.style.display = "";
    });
});

loadContacts();

