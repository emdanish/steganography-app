# Steganograph - Image Steganography Web Application

Steganograph is a modern web application that allows you to hide secret images within carrier images using LSB (Least Significant Bit) steganography techniques. This project combines a beautiful, responsive frontend with a powerful Python backend.

## Features

- **Hide Images**: Embed a secret image inside a carrier image
- **Extract Images**: Reveal hidden images from steganographic images
- **Password Protection**: Add an extra layer of security with password-based encryption
- **Adjustable Quality**: Choose between different quality levels for steganography
- **Modern UI/UX**: Intuitive, responsive design with smooth animations and transitions
- **Drag & Drop Interface**: Easy image upload via drag and drop
- **Dark Mode**: Toggle between light and dark themes

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python with Flask
- **Image Processing**: NumPy, PIL (Python Imaging Library)
- **Steganography**: Custom LSB implementation

## Local Development Setup

1. Clone this repository:
   ```
   git clone <repository-url>
   cd steganography-app
   ```

2. Set up a Python virtual environment (optional but recommended):
   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python app.py
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## How Steganography Works

This application implements LSB (Least Significant Bit) steganography, a technique that hides information by replacing the least significant bits of pixels in the carrier image with bits from the secret image.

The quality setting determines how many bits are used:
- **Low Quality (1)**: Uses 1 bit per color channel (can store larger secret images)
- **Medium Quality (2)**: Uses 2 bits per color channel (balanced approach)
- **High Quality (3)**: Uses 3 bits per color channel (higher quality secret image but less capacity)

## Deployment Options

### Vercel Deployment

To deploy this application on Vercel:

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Create a `vercel.json` file in your project root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "app.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "app.py"
       }
     ]
   }
   ```

3. Deploy using Vercel CLI:
   ```
   vercel
   ```

### Heroku Deployment

To deploy this application on Heroku:

1. Create a `Procfile` with the following content:
   ```
   web: gunicorn app:app
   ```

2. Install the Heroku CLI and log in:
   ```
   heroku login
   ```

3. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```

4. Deploy the application:
   ```
   git push heroku main
   ```

### PythonAnywhere

This application can also be deployed on PythonAnywhere:

1. Sign up for a PythonAnywhere account
2. Upload your project files
3. Set up a new web app using Flask
4. Configure the WSGI file to point to your app

## Usage Tips

- For best results, use PNG images as carriers
- Larger carrier images can hide more information
- Use the password feature for sensitive information
- The carrier image should be significantly larger than the secret image

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 