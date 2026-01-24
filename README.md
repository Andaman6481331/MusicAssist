

NEED Python3.9.13 !!!!!!!!!!
(check using "python --version" in backend folder)

installation
<!-- 0) cmd
1) get into backend folder (cd backend)
2) once in the backend directory, type-> .\.venv\Scripts\activate
3) then install these commands: 

	pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cu121 -->

use another terminal to install frontend library
0) cmd
1) get into frontend folder (cd frontend)
2) npm init -y
3) npm install react react-dom tone @tonejs/midi

==================================================================================================

Run Backend
0) cmd
1) get into backend folder (cd backend)
2) once in the backend directory, type-> .\.venv\Scripts\activate
3) uvicorn server:app --host 0.0.0.0 --port 8000

Run Frontend
0) cmd
1) get into frontend folder (cd frontend)
2) npm run dev


other...
<Python3.9.13 dir
C:/Users/herby/PycharmProjects/PythonProject/.venv1/Scripts/python.exe>

pip install basic-pitch fastapi uvicorn	//

pip install torch==2.1.0+cu121 --index-url https://download.pytorch.org/whl/cu121

pip install -r pipreqRequirements.txt


python3.9 -m venv .venv
source .venv/bin/activate


pip install frechet-audio-distance

