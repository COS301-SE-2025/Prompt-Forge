import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration settings for the Prompt Optimizer API"""
    
    # API Configuration
    API_TITLE = "Prompt Optimizer API"
    API_HOST = "0.0.0.0"
    API_PORT = 8001
    
    # Hugging Face Configuration
    HF_TOKEN = os.getenv("HF_TOKEN", "")
    HF_ROUTER_BASE_URL = "https://router.huggingface.co/v1"
    
    # Qwen Model Endpoints
    QWEN_MODEL_ENDPOINTS = [
        "Qwen/Qwen2.5-72B-Instruct",
        "Qwen/Qwen2.5-32B-Instruct", 
        "Qwen/Qwen2.5-14B-Instruct",
        "Qwen/Qwen2.5-7B-Instruct"
    ]
    
    # Excellence Thresholds
    EXCELLENCE_THRESHOLDS = {
        "clarity": 85,
        "specificity": 80,
        "structure": 88,
        "context": 82,
        "overall": 84
    }
    
    # Metric Weights
    METRIC_WEIGHTS = {
        "clarity": 0.3,
        "specificity": 0.25,
        "structure": 0.25,
        "context": 0.2
    }

def setup_logging():
    """Configure logging for the application"""
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("prompt_optimizer")
    logger.setLevel(logging.DEBUG)

    console_handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] %(levelname)s - %(message)s")
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger

# Initialize logger
logger = setup_logging()