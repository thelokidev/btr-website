# BTR (Birth Time Rectification)

A web application for rectifying birth times using astrological parameters. This tool helps astrologers and enthusiasts accurately determine birth times by considering various factors such as tatwas, moon star lords, and lagna types.

## Project Structure

- `btr-website/` - Main project directory
  - `frontend/` - React frontend application
  - `backend/` - Python Flask backend application

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd btr-website/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd btr-website/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request
