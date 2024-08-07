from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Function to read file content
def read_file_content(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            return {'success': True, 'content': content}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# Function to write file content
def write_file_content(file_path, content):
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
            return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# Endpoint to open file
@app.route('/open-file', methods=['POST'])
def open_file():
    file_path = request.json.get('filePath')
    if not os.path.exists(file_path):
        return jsonify({'success': False, 'error': f'File {file_path} not found'})

    return jsonify(read_file_content(file_path))

# Endpoint to save file
@app.route('/save-file', methods=['POST'])
def save_file():
    file_path = request.json.get('filePath')
    content = request.json.get('content')
    return jsonify(write_file_content(file_path, content))

# Endpoint to save file as
@app.route('/save-file-as', methods=['POST'])
def save_file_as():
    file_path = request.json.get('filePath')
    content = request.json.get('content')
    return jsonify(write_file_content(file_path, content))

# Endpoint to create tab (not implemented fully here)
@app.route('/create-tab', methods=['POST'])
def create_tab():
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
