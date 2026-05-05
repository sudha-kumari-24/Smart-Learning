# Navigate to AI Support folder
cd C:\Sudhadocuments\Sem7\project last sem\student_peers\backend\AISupport_backend

cd backend/AISupport_backend

# Create a NEW virtual environment (not the Node one)
python -m venv ai_venv

# Activate it
ai_venv\Scripts\activate

# Now install from requirements.txt
pip install -r requirements.txt

# Run the server
python ai_support_server.py

cd backend/AISupport_backend
python recommendation_server.py