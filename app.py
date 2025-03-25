from flask import Flask, request, jsonify, send_from_directory, send_file, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import tempfile
import traceback
from steganography import hide_image, extract_image

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')
CORS(app)

UPLOAD_FOLDER = tempfile.mkdtemp()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/hide', methods=['POST'])
def hide():
    if 'carrier' not in request.files or 'secret' not in request.files:
        return jsonify({'error': 'Missing carrier or secret image'}), 400
    
    carrier_file = request.files['carrier']
    secret_file = request.files['secret']
    
    carrier_temp = os.path.join(UPLOAD_FOLDER, secure_filename('carrier_' + carrier_file.filename))
    secret_temp = os.path.join(UPLOAD_FOLDER, secure_filename('secret_' + secret_file.filename))
    
    output_temp = os.path.join(UPLOAD_FOLDER, 'steganography_result.png')
    
    try:
        carrier_file.save(carrier_temp)
        secret_file.save(secret_temp)
        
        print(f"Files saved: carrier={carrier_temp}, secret={secret_temp}")
        
        try:
            hide_image(carrier_temp, secret_temp, output_temp)
            print(f"Steganography complete, result saved to {output_temp}")
            
            return send_file(output_temp, mimetype='image/png', 
                             as_attachment=True, download_name='steganography_result.png')
        except ValueError as e:
            print(f"Steganography error: {str(e)}")
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            print(f"Error in steganography process: {str(e)}")
            print(traceback.format_exc())
            return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500
    finally:
        for file in [carrier_temp, secret_temp]:
            if os.path.exists(file):
                os.remove(file)

@app.route('/api/extract', methods=['POST'])
def extract():
    if 'stego' not in request.files:
        return jsonify({'error': 'Missing steganographic image'}), 400
    
    stego_file = request.files['stego']
    
    if stego_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    stego_temp = os.path.join(UPLOAD_FOLDER, secure_filename('stego_' + stego_file.filename))
    output_temp = os.path.join(UPLOAD_FOLDER, 'extracted_result.png')
    
    try:
        stego_file.save(stego_temp)
        print(f"File saved: stego={stego_temp}")
        
        try:
            extract_image(stego_temp, output_temp)
            print(f"Extraction complete, result saved to {output_temp}")
            
            return send_file(output_temp, mimetype='image/png', 
                             as_attachment=True, download_name='extracted_result.png')
        except Exception as e:
            print(f"Error in extraction process: {str(e)}")
            print(traceback.format_exc())
            return jsonify({'error': f'An unexpected error occurred during extraction: {str(e)}'}), 500
    finally:
        if os.path.exists(stego_temp):
            os.remove(stego_temp)

if __name__ == '__main__':
    print(f"Starting server with upload folder: {UPLOAD_FOLDER}")
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 