# Marketing Campaign Application

This project is a MERN stack application for managing marketing campaigns.

## Running the Application

These instructions will guide you on how to get a copy of the project up and running on your local machine.

### Prerequisites

*   Node.js and npm installed on your system.
*   A MongoDB database. You can get a free one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install Backend Dependencies:**
    In the root directory of the project, run the command:
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies:**
    Go into the `frontend` directory and run the install command again:
    ```bash
    cd frontend
    npm install
    cd ..
    ```

4.  **Create Environment File:**
    In the root directory of the project, create a file named `.env`. Add the following content to the file:
    ```
    MONGO_URI=<your-mongodb-connection-string>
    NODE_ENV=production
    JWT_SECRET=<your-jwt-secret-key>
    ```
    -   Replace `<your-mongodb-connection-string>` with your actual MongoDB connection string.
    -   Replace `<your-jwt-secret-key>` with any long, random string. This key is used to secure user login sessions.

    *Example `MONGO_URI`: `mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority`*

5.  **Build the Frontend:**
    Go into the `frontend` directory:
    ```bash
    cd frontend
    ```
    Run the build command:
    ```bash
    npm run build
    ```
    This will create a `build` folder inside the `frontend` directory.

6.  **Start the Server:**
    Go back to the root directory of the project:
    ```bash
    cd ..
    ```
    Run the command:
    ```bash
    node server.js
    ```

7.  **Access the Application:**
    Open your web browser and go to `http://localhost:5000`.

The application should now be running. The server handles both the backend API and serves the frontend user interface.
