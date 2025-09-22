from fastapi import FastAPI
from config import Config, logger
from models import (
    AnalysisResponse, OptimizationResponse, GoalOptimizationResponse,
    StructureOptimizationResponse, ContextOptimizationResponse, TokenValidationResponse,
    PromptRequest, GoalBasedRequest, StructureBasedRequest, ContextBasedRequest
)
from routes import (
    health_check, read_root, analyze_prompt_metrics, optimize_prompt,
    optimize_prompt_with_goals, optimize_prompt_with_structure,
    optimize_prompt_with_context, validate_token
)

# ----------------------------
# FastAPI Initialization
# ----------------------------
app = FastAPI(title=Config.API_TITLE)

# ----------------------------
# Route Registration
# ----------------------------

@app.get("/")
def root():
    """Root endpoint"""
    return read_root()

@app.get("/health")
def health():
    """Health check endpoint"""
    return health_check()

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: PromptRequest):
    """Analyze prompt metrics without generating suggestions"""
    return await analyze_prompt_metrics(request)

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize(request: PromptRequest):
    """Basic prompt optimization (legacy endpoint)"""
    return await optimize_prompt(request)

@app.post("/optimize-with-goals", response_model=GoalOptimizationResponse)
async def optimize_goals(request: GoalBasedRequest):
    """Optimize prompt using Qwen based on user goals and current metrics"""
    return await optimize_prompt_with_goals(request)

@app.post("/optimize-with-structure", response_model=StructureOptimizationResponse)
async def optimize_structure(request: StructureBasedRequest):
    """Optimize prompt structure using Qwen based on selected options and current metrics"""
    return await optimize_prompt_with_structure(request)

@app.post("/optimize-with-context", response_model=ContextOptimizationResponse)
async def optimize_context(request: ContextBasedRequest):
    """Optimize prompt context using Qwen based on selected options and current metrics"""
    return await optimize_prompt_with_context(request)

@app.get("/validate-token", response_model=TokenValidationResponse)
def token_validation():
    """Validate service availability"""
    return validate_token()

# ----------------------------
# Application Startup
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting Prompt Optimizer API on {Config.API_HOST}:{Config.API_PORT}")
    uvicorn.run(app, host=Config.API_HOST, port=Config.API_PORT)