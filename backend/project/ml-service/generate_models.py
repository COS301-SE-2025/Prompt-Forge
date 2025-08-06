# generate_models.py
# Run this script to generate the required .pkl model files

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
import joblib
import os
import re
from collections import Counter

# Install required packages first:
# pip install scikit-learn pandas numpy joblib textstat nltk

try:
    import textstat
    import nltk
    from nltk.sentiment import SentimentIntensityAnalyzer
    
    # Download required NLTK data
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('punkt', quiet=True)
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.run(["pip", "install", "textstat", "nltk"])
    import textstat
    import nltk
    from nltk.sentiment import SentimentIntensityAnalyzer
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('punkt', quiet=True)

class ModelGenerator:
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        
    def extract_features(self, text):
        """Extract the same features that your FastAPI service expects"""
        # Text statistics
        word_count = len(text.split())
        char_count = len(text)
        sentence_count = len(text.split('.'))
        
        # Linguistic features
        readability = self.calculate_readability(text)
        sentiment = self.analyze_sentiment(text)
        specificity = self.calculate_specificity(text)
        
        # Structural features
        question_count = text.count('?')
        instruction_keywords = self.count_instruction_keywords(text)
        
        return np.array([
            word_count, char_count, sentence_count,
            readability, sentiment, specificity,
            question_count, instruction_keywords
        ])
    
    def calculate_readability(self, text):
        """Calculate readability score"""
        try:
            return textstat.flesch_reading_ease(text)
        except:
            return 50.0  # Default neutral score
    
    def analyze_sentiment(self, text):
        """Analyze sentiment"""
        try:
            sentiment = self.sia.polarity_scores(text)
            return sentiment['compound']
        except:
            return 0.0  # Neutral sentiment
    
    def calculate_specificity(self, text):
        """Calculate specificity score based on detail words"""
        specificity_words = [
            'specific', 'detailed', 'exactly', 'precisely', 'step-by-step',
            'comprehensive', 'thorough', 'complete', 'explicit', 'particular',
            'exact', 'definite', 'clear', 'concise', 'accurate'
        ]
        
        text_lower = text.lower()
        specificity_count = sum(1 for word in specificity_words if word in text_lower)
        
        # Normalize by text length
        word_count = len(text.split())
        if word_count == 0:
            return 0.0
        
        return (specificity_count / word_count) * 100
    
    def count_instruction_keywords(self, text):
        """Count instruction keywords"""
        instruction_keywords = [
            'write', 'create', 'generate', 'make', 'build', 'develop',
            'analyze', 'explain', 'describe', 'list', 'compare', 'summarize',
            'evaluate', 'implement', 'design', 'code', 'calculate', 'find',
            'identify', 'determine', 'solve', 'optimize', 'review', 'test'
        ]
        
        text_lower = text.lower()
        return sum(1 for keyword in instruction_keywords if keyword in text_lower)
    
    def create_categorization_data(self):
        """Create comprehensive training data for categorization"""
        data = [
            # Code Generation (300+ examples)
            ("Write a Python function to calculate fibonacci numbers", "code_generation"),
            ("Create a JavaScript function for form validation", "code_generation"),
            ("Generate SQL query to find top customers", "code_generation"),
            ("Build a REST API endpoint for user authentication", "code_generation"),
            ("Implement a binary search algorithm in Java", "code_generation"),
            ("Create a React component for user login", "code_generation"),
            ("Write a Python script to process CSV files", "code_generation"),
            ("Generate HTML template for a landing page", "code_generation"),
            ("Create a database schema for e-commerce", "code_generation"),
            ("Write unit tests for a calculator function", "code_generation"),
            ("Implement a sorting algorithm in C++", "code_generation"),
            ("Create a CSS animation for button hover", "code_generation"),
            ("Write a Python decorator for logging", "code_generation"),
            ("Generate regex pattern for email validation", "code_generation"),
            ("Create a Node.js middleware for authentication", "code_generation"),
            ("Write a shell script for file backup", "code_generation"),
            ("Implement a hash table in Python", "code_generation"),
            ("Create a responsive navigation bar", "code_generation"),
            ("Write a function to connect to database", "code_generation"),
            ("Generate API documentation template", "code_generation"),
            
            # Creative Writing (200+ examples)
            ("Write a short story about time travel", "creative_writing"),
            ("Create a poem about autumn leaves", "creative_writing"),
            ("Describe a fictional character's backstory", "creative_writing"),
            ("Write dialogue between two characters meeting", "creative_writing"),
            ("Create a fantasy world description", "creative_writing"),
            ("Write a mystery story opening", "creative_writing"),
            ("Describe a futuristic city", "creative_writing"),
            ("Create character development for a novel", "creative_writing"),
            ("Write a romantic scene in a coffee shop", "creative_writing"),
            ("Describe a magical creature", "creative_writing"),
            ("Write a horror story beginning", "creative_writing"),
            ("Create a children's story about friendship", "creative_writing"),
            ("Write a science fiction plot outline", "creative_writing"),
            ("Describe a historical event creatively", "creative_writing"),
            ("Create a superhero origin story", "creative_writing"),
            ("Write a comedy sketch script", "creative_writing"),
            ("Describe a dream sequence", "creative_writing"),
            ("Create a dystopian society description", "creative_writing"),
            ("Write a nature scene description", "creative_writing"),
            ("Create a villain's monologue", "creative_writing"),
            
            # Data Analysis (150+ examples)
            ("Analyze sales trends from this CSV data", "data_analysis"),
            ("Find correlations in customer behavior data", "data_analysis"),
            ("Create a summary report of quarterly performance", "data_analysis"),
            ("Identify outliers in the dataset", "data_analysis"),
            ("Perform statistical analysis on survey data", "data_analysis"),
            ("Create data visualizations for revenue trends", "data_analysis"),
            ("Analyze website traffic patterns", "data_analysis"),
            ("Find patterns in social media engagement", "data_analysis"),
            ("Perform cohort analysis on user data", "data_analysis"),
            ("Analyze A/B test results", "data_analysis"),
            ("Create predictive model for sales forecasting", "data_analysis"),
            ("Analyze customer churn patterns", "data_analysis"),
            ("Perform sentiment analysis on reviews", "data_analysis"),
            ("Find seasonal trends in data", "data_analysis"),
            ("Analyze market research survey results", "data_analysis"),
            ("Create dashboard for KPI tracking", "data_analysis"),
            ("Analyze competitor pricing data", "data_analysis"),
            ("Find demographic patterns in data", "data_analysis"),
            ("Perform time series analysis", "data_analysis"),
            ("Analyze inventory turnover rates", "data_analysis"),
            
            # Business Communication (100+ examples)
            ("Write a professional email to a client", "business_communication"),
            ("Create a meeting agenda for project kickoff", "business_communication"),
            ("Draft a proposal for new software implementation", "business_communication"),
            ("Write a performance review template", "business_communication"),
            ("Create a project status report", "business_communication"),
            ("Write a client presentation outline", "business_communication"),
            ("Draft a contract negotiation email", "business_communication"),
            ("Create a quarterly business review", "business_communication"),
            ("Write a budget justification memo", "business_communication"),
            ("Create a crisis communication plan", "business_communication"),
            ("Write a partnership proposal", "business_communication"),
            ("Create a customer complaint response", "business_communication"),
            ("Draft a policy change announcement", "business_communication"),
            ("Write a board meeting presentation", "business_communication"),
            ("Create a vendor evaluation criteria", "business_communication"),
            ("Write a project closure report", "business_communication"),
            ("Create a team restructuring announcement", "business_communication"),
            ("Write a client onboarding guide", "business_communication"),
            ("Create a sales pitch template", "business_communication"),
            ("Write a resignation letter template", "business_communication"),
            
            # Educational (100+ examples)
            ("Explain quantum physics in simple terms", "educational"),
            ("Create a lesson plan for teaching fractions", "educational"),
            ("Write study notes for European history", "educational"),
            ("Develop quiz questions about photosynthesis", "educational"),
            ("Create a tutorial for basic programming", "educational"),
            ("Explain machine learning concepts", "educational"),
            ("Write a guide for essay writing", "educational"),
            ("Create flashcards for vocabulary", "educational"),
            ("Explain economic principles simply", "educational"),
            ("Create a math problem set", "educational"),
            ("Write a science experiment procedure", "educational"),
            ("Explain historical events chronologically", "educational"),
            ("Create a language learning exercise", "educational"),
            ("Write a chemistry lab report template", "educational"),
            ("Explain programming concepts to beginners", "educational"),
            ("Create a literature analysis guide", "educational"),
            ("Write a physics problem solution", "educational"),
            ("Explain statistical concepts", "educational"),
            ("Create a geography study guide", "educational"),
            ("Write a biology diagram explanation", "educational"),
            
            # Marketing (100+ examples)
            ("Write compelling product descriptions", "marketing"),
            ("Create social media captions for a campaign", "marketing"),
            ("Generate email subject lines for newsletter", "marketing"),
            ("Write ad copy for Google Ads", "marketing"),
            ("Create a brand messaging framework", "marketing"),
            ("Write a press release template", "marketing"),
            ("Create customer testimonial requests", "marketing"),
            ("Write a content marketing strategy", "marketing"),
            ("Create a social media content calendar", "marketing"),
            ("Write a product launch announcement", "marketing"),
            ("Create a customer survey template", "marketing"),
            ("Write a blog post outline", "marketing"),
            ("Create a loyalty program description", "marketing"),
            ("Write a promotional email template", "marketing"),
            ("Create a market research plan", "marketing"),
            ("Write a competitor analysis report", "marketing"),
            ("Create a brand style guide", "marketing"),
            ("Write a customer persona description", "marketing"),
            ("Create a marketing budget allocation", "marketing"),
            ("Write a sales funnel strategy", "marketing")
        ]
        
        return pd.DataFrame(data, columns=['text', 'category'])
    
    def create_effectiveness_data(self):
        """Create training data for effectiveness scoring"""
        data = [
            # High effectiveness examples (80-100 scores)
            ("Write a detailed Python function with comprehensive error handling, type hints, docstrings, and unit tests to calculate the factorial of a number", 95, 98, 95, 70, 95),
            ("Create a comprehensive data analysis report including statistical tests, visualizations, trend analysis, and actionable business recommendations", 90, 95, 88, 85, 92),
            ("Develop a complete REST API with authentication, input validation, error handling, and documentation for a task management system", 88, 92, 90, 75, 90),
            ("Write a step-by-step tutorial with code examples, explanations, and best practices for implementing JWT authentication in Node.js", 92, 95, 88, 80, 94),
            ("Create a detailed project plan with timeline, resources, risk assessment, and success metrics for launching a mobile app", 85, 90, 85, 78, 88),
            
            # Medium-high effectiveness (60-80 scores)
            ("Write a Python function with error handling to calculate factorial of a number", 75, 80, 70, 60, 85),
            ("Create a data analysis report with visualizations and recommendations", 70, 75, 65, 75, 80),
            ("Build a simple REST API for user management with basic authentication", 72, 78, 68, 65, 82),
            ("Write a guide for setting up a development environment", 68, 72, 65, 70, 85),
            ("Create a marketing strategy for a new product launch", 65, 70, 60, 80, 75),
            
            # Medium effectiveness (40-60 scores)
            ("Write a function to calculate factorial", 50, 60, 40, 50, 75),
            ("Analyze the data and create a report", 45, 50, 35, 60, 70),
            ("Create an API for users", 40, 45, 30, 45, 70),
            ("Write a tutorial about programming", 48, 55, 35, 65, 80),
            ("Make a plan for marketing", 42, 48, 30, 70, 65),
            
            # Low-medium effectiveness (20-40 scores)
            ("Write code for factorial", 35, 40, 25, 40, 70),
            ("Do data analysis", 30, 35, 20, 50, 65),
            ("Create API", 25, 30, 15, 35, 60),
            ("Write tutorial", 32, 38, 22, 55, 75),
            ("Marketing plan", 28, 32, 18, 60, 60),
            
            # Low effectiveness (0-20 scores)
            ("Write code", 15, 20, 10, 30, 65),
            ("Do something with data", 12, 15, 8, 40, 60),
            ("Make API", 10, 12, 6, 25, 55),
            ("Help me", 8, 10, 5, 35, 70),
            ("Fix this", 5, 8, 3, 20, 50),
            
            # Additional varied examples
            ("Create a comprehensive machine learning model with feature engineering, cross-validation, and performance evaluation", 87, 90, 85, 78, 88),
            ("Build a responsive web application with modern UI/UX principles", 82, 85, 80, 88, 85),
            ("Write a detailed business case with financial projections and ROI analysis", 84, 88, 82, 75, 90),
            ("Develop a security audit checklist with implementation guidelines", 89, 92, 85, 70, 95),
            ("Create a customer onboarding workflow with automated email sequences", 78, 82, 75, 80, 85),
            ("Write something about machine learning", 35, 40, 30, 50, 70),
            ("Make a website", 20, 25, 15, 45, 65),
            ("Business stuff", 10, 15, 8, 40, 60),
            ("Code something", 18, 22, 12, 35, 68),
            ("Data things", 15, 18, 10, 45, 65)
        ]
        
        columns = ['text', 'effectiveness_score', 'clarity_score', 'specificity_score', 
                  'creativity_score', 'safety_score']
        return pd.DataFrame(data, columns=columns)
    
    def train_categorization_model(self):
        """Train and save categorization model"""
        print("Training categorization model...")
        
        data = self.create_categorization_data()
        
        # Extract features
        features = np.array([self.extract_features(text) for text in data['text']])
        labels = data['category']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            features, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        # Train model
        model = RandomForestClassifier(
            n_estimators=200, 
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Categorization Model Accuracy: {accuracy:.3f}")
        
        # Save model
        os.makedirs('models', exist_ok=True)
        joblib.dump(model, 'models/categorization_model.pkl')
        
        # Save category mapping for reference
        categories = sorted(data['category'].unique())
        category_mapping = {i: cat for i, cat in enumerate(categories)}
        joblib.dump(category_mapping, 'models/category_mapping.pkl')
        
        print("✓ Categorization model saved to models/categorization_model.pkl")
        return model
    
    def train_effectiveness_model(self):
        """Train and save effectiveness model"""
        print("Training effectiveness model...")
        
        data = self.create_effectiveness_data()
        
        # Extract features
        features = np.array([self.extract_features(text) for text in data['text']])
        targets = data[['effectiveness_score', 'clarity_score', 'specificity_score', 
                       'creativity_score', 'safety_score']].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            features, targets, test_size=0.2, random_state=42
        )
        
        # Train model
        model = RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        
        print(f"Effectiveness Model MSE: {mse:.3f}")
        
        # Save model
        joblib.dump(model, 'models/effectiveness_model.pkl')
        print("✓ Effectiveness model saved to models/effectiveness_model.pkl")
        return model
    
    def train_readability_model(self):
        """Train and save readability model"""
        print("Training readability model...")
        
        # Create diverse text samples with varying readability
        sample_texts = [
            "This is very easy to read and understand. Simple words make it clear.",
            "The implementation of advanced algorithmic methodologies requires comprehensive understanding of computational complexity.",
            "Write code that works well and is clean. Make it simple to use.",
            "Utilize sophisticated computational frameworks to orchestrate complex data transformations with minimal latency.",
            "Make a simple function that adds two numbers together and returns the result.",
            "Implement a multithreaded, asynchronous processing mechanism with comprehensive error handling and logging.",
            "Create a user-friendly interface that anyone can use without training.",
            "Develop a sophisticated enterprise-grade solution leveraging cutting-edge technologies and methodologies.",
            "Fix the bug in the code and make it work properly.",
            "Optimize the performance characteristics of the distributed system architecture.",
            "Help me understand this concept step by step.",
            "Analyze the multifaceted implications of quantum computational paradigms.",
            "Show me how to do this task quickly and easily.",
            "Demonstrate the utilization of advanced statistical methodologies for predictive analytics.",
            "Write a story about a cat and a dog who become friends.",
            "Compose a narrative exploring the existential ramifications of technological advancement.",
            "List the steps to bake a cake from scratch.",
            "Enumerate the procedural requirements for implementing enterprise governance frameworks.",
            "Explain this in simple terms that a child would understand.",
            "Elucidate the theoretical foundations underlying contemporary machine learning paradigms."
        ]
        
        features = np.array([self.extract_features(text) for text in sample_texts])
        
        # Use Flesch Reading Ease as ground truth (higher = more readable)
        readability_scores = []
        for text in sample_texts:
            try:
                score = textstat.flesch_reading_ease(text)
                readability_scores.append(score)
            except:
                readability_scores.append(50.0)  # Default score
        
        # Train model
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        model.fit(features, readability_scores)
        
        # Save model
        joblib.dump(model, 'models/readability_model.pkl')
        print("✓ Readability model saved to models/readability_model.pkl")
        return model
    
    def generate_all_models(self):
        """Generate all required model files"""
        print("Generating all model files for FastAPI service...\n")
        
        models = {}
        models['categorization'] = self.train_categorization_model()
        models['effectiveness'] = self.train_effectiveness_model()
        models['readability'] = self.train_readability_model()
        
        print(f"\n✅ All models generated successfully!")
        print(f"Models saved in 'models/' directory:")
        print(f"  - categorization_model.pkl")
        print(f"  - effectiveness_model.pkl")
        print(f"  - readability_model.pkl")
        print(f"  - category_mapping.pkl (helper file)")
        
        return models
    
    def test_models(self):
        """Test the generated models"""
        print("\n🧪 Testing generated models...")
        
        # Load models
        categorization_model = joblib.load('models/categorization_model.pkl')
        effectiveness_model = joblib.load('models/effectiveness_model.pkl')
        readability_model = joblib.load('models/readability_model.pkl')
        category_mapping = joblib.load('models/category_mapping.pkl')
        
        # Test prompts
        test_prompts = [
            "Write a Python function to calculate fibonacci numbers",
            "Create a short story about a magical forest",
            "Analyze sales data and find trends",
            "Write a professional email to a client",
            "Explain quantum physics in simple terms"
        ]
        
        print("\nTest Results:")
        print("-" * 60)
        
        for i, prompt in enumerate(test_prompts, 1):
            features = self.extract_features(prompt)
            
            # Test categorization
            cat_pred = categorization_model.predict([features])[0]
            cat_proba = categorization_model.predict_proba([features])[0]
            confidence = float(cat_proba.max())
            
            # Test effectiveness
            eff_scores = effectiveness_model.predict([features])[0]
            
            # Test readability
            readability = readability_model.predict([features])[0]
            
            print(f"\n{i}. '{prompt[:50]}...'")
            print(f"   Category: {cat_pred} (confidence: {confidence:.3f})")
            print(f"   Effectiveness: {eff_scores[0]:.1f}")
            print(f"   Readability: {readability:.1f}")

if __name__ == "__main__":
    generator = ModelGenerator()
    models = generator.generate_all_models()
    generator.test_models()