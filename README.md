# Steganograph - Image Steganography Web Application

Steganograph is a modern web application that allows you to hide secret images within carrier images using LSB (Least Significant Bit) steganography techniques. This project combines a beautiful, responsive frontend with a powerful Python backend.

## Features

- **Hide Images**: Embed a secret image inside a carrier image
- **Extract Images**: Reveal hidden images from steganographic images
- **Modern UI/UX**: Intuitive, responsive design with smooth animations and transitions

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

## Usage Tips

- For best results, use PNG images as carriers.
- Larger carrier images can hide more information.
- The carrier image should be significantly larger than the secret image.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 
