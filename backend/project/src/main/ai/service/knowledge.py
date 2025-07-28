import requests
from typing import List
import logging

logger = logging.getLogger(__name__)

class ConceptNetAPI:
    def __init__(self):
        self.base_url = "http://api.conceptnet.io"
        self.cache = {}
    
    def get_related_terms(self, term: str) -> List[str]:
        """Fetch related terms from ConceptNet with improved filtering"""
        if term in self.cache:
            return self.cache[term]
        
        try:
            response = requests.get(
                f"{self.base_url}/query?node=/c/en/{term}&rel=/r/RelatedTo&limit=15"  # Increased limit
            ).json()
            
            related = set()
            for edge in response.get("edges", []):
                label = edge["end"]["label"].lower()
                if self._is_valid_term(label) and edge["weight"] > 0.5:  # Filter by edge weight
                    related.add(label)
            
            self.cache[term] = list(related)[:10]  # Limit to top 10
            return self.cache[term]
        
        except Exception as e:
            logger.error(f"ConceptNet query failed: {str(e)}")
            return []

    def _is_valid_term(self, term: str) -> bool:
        """Enhanced validation for related terms"""
        return (len(term) >= 3 and 
                term.replace("_", "").replace("-", "").isalpha() and
                " " not in term and
                not term.startswith("anti") and  # Exclude opposites
                not term.endswith("ing"))  # Exclude gerunds