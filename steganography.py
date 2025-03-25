import numpy as np
from PIL import Image
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_stego_validity(image_path):
    try:
        img = Image.open(image_path).convert('RGB')
        img_array = np.array(img)
        
        if img.width < 8 or img.height < 3:
            logger.info(f"Image is too small: {img.width}x{img.height}")
            return False
        
        metadata = bytearray(6)
        meta_idx = 0
        
        for i in range(2):
            for j in range(3):
                try:
                    metadata[meta_idx] = 0
                    metadata[meta_idx] |= (img_array[0, i, j] & 1) << 7
                    metadata[meta_idx] |= (img_array[0, i+1, j] & 1) << 6
                    metadata[meta_idx] |= (img_array[0, i+2, j] & 1) << 5
                    metadata[meta_idx] |= (img_array[0, i+3, j] & 1) << 4
                    metadata[meta_idx] |= (img_array[0, i+4, j] & 1) << 3
                    metadata[meta_idx] |= (img_array[0, i+5, j] & 1) << 2
                    metadata[meta_idx] |= (img_array[0, i+6, j] & 1) << 1
                    metadata[meta_idx] |= (img_array[0, i+7, j] & 1)
                    meta_idx += 1
                except IndexError:
                    logger.info("Metadata region error")
                    return False
        
        try:
            width = int.from_bytes(metadata[0:2], byteorder='big')
            height = int.from_bytes(metadata[2:4], byteorder='big')
            quality = metadata[4]
            
            if quality < 1 or quality > 3:
                logger.info(f"Invalid quality level: {quality}")
                return False
            
            if width <= 0 or height <= 0:
                logger.info(f"Invalid dimensions: {width}x{height}")
                return False
            
            if width > img.width or height > img.height - 3:
                logger.info(f"Dimensions too large: {width}x{height} for image {img.width}x{img.height}")
                return False
            
            if width * height > (img.width * img.height) / 2:
                logger.info(f"Suspicious dimensions: {width}x{height} is too large for carrier {img.width}x{img.height}")
                return False
                
            logger.info(f"Valid steganographic metadata found: width={width}, height={height}, quality={quality}")
            return True
            
        except Exception as e:
            logger.info(f"Failed to parse metadata: {str(e)}")
            return False
    
    except Exception as e:
        logger.info(f"Error checking image: {str(e)}")
        return False

def hide_image(carrier_path, secret_path, output_path, quality=2, password=''):
    carrier = Image.open(carrier_path).convert('RGB')
    secret = Image.open(secret_path).convert('RGB')
    
    secret = secret.resize(carrier.size, Image.LANCZOS)
    
    carrier_arr = np.array(carrier)
    secret_arr = np.array(secret)
    
    carrier_arr = (carrier_arr >> 1) << 1
    secret_bits = (secret_arr >> 7)
    stego_arr = carrier_arr | secret_bits
    
    stego_img = Image.fromarray(stego_arr)
    stego_img.save(output_path, format='PNG')
    logger.info(f"Steganographic image saved to {output_path}")
    return True

def extract_image(stego_path, output_path, password=''):
    stego_img = Image.open(stego_path).convert('RGB')
    stego_arr = np.array(stego_img)
    
    extracted_arr = ((stego_arr & 1) << 7).astype(np.uint8)
    
    extracted_img = Image.fromarray(extracted_arr)
    extracted_img.save(output_path, format='PNG')
    logger.info(f"Extracted image saved to {output_path}")
    return True

def analyze_carrier_capacity(carrier_path, quality=2):
    carrier = Image.open(carrier_path).convert('RGB')
    
    max_width = carrier.width // (8 // quality)
    max_height = carrier.height - 3
    
    max_width = min(max_width, carrier.width)
    max_height = min(max_height, carrier.height - 3)
    
    bits_per_pixel = quality * 3
    
    total_capacity_bits = carrier.width * carrier.height * bits_per_pixel
    total_capacity_bytes = total_capacity_bits // 8
    
    usable_capacity_bits = total_capacity_bits - (6 * 8)
    usable_capacity_bytes = usable_capacity_bits // 8
    
    return {
        'carrier_dimensions': (carrier.width, carrier.height),
        'max_secret_dimensions': (max_width, max_height),
        'bits_per_pixel': bits_per_pixel,
        'total_capacity_bytes': total_capacity_bytes,
        'usable_capacity_bytes': usable_capacity_bytes,
    } 