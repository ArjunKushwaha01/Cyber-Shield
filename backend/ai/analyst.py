from typing import List, Dict, Any
import re

class DataAnalyst:
    def __init__(self):
        self.system_prompt = "You are a data analyst helper."

    def analyze_query(self, query: str, context: Dict[str, Any]) -> str:
        """
        Analyzes a natural language query against the provided data context (headers/rows).
        Returns a text response.
        """
        query = query.lower()
        headers = [h.lower() for h in context.get("headers", [])]
        rows = context.get("rows", [])
        
        if not rows:
            return "I don't see any data in this table to analyze."

        # 1. Count / How many
        if "count" in query or "how many" in query:
            return f"This dataset contains {len(rows)} rows of data."

        # 2. Find / Show
        # e.g. "Show me admin" or "Find valid emails"
        if "find" in query or "show" in query or "search" in query:
            # Check for keywords in rows
            # Extract basic keywords (dumb extraction)
            words = query.split()
            keywords = [w for w in words if w not in ["find", "show", "search", "me", "all", "rows", "records", "with", "where"]]
            
            if not keywords:
                 return "What would you like me to find? Try 'Find admin' or 'Show error'."

            target = keywords[0]
            matches = 0
            sample = []
            
            for row in rows:
                row_str = " ".join([str(c).lower() for c in row])
                if target in row_str:
                    matches += 1
                    if len(sample) < 3:
                        sample.append(str(row))
            
            if matches > 0:
                return f"I found {matches} rows containing '{target}'.\nHere are a few: {', '.join(sample)}"
            else:
                return f"I couldn't find any rows containing '{target}'."

        # 3. Headers / Structure
        if "column" in query or "header" in query or "structure" in query:
             return f"The table has {len(headers)} columns: {', '.join(context.get('headers', []))}."

        # 4. Summarize
        if "summarize" in query or "summary" in query:
             return f"This is a {len(rows)}-row dataset with columns: {', '.join(context.get('headers', []))}. It looks like a {self._guess_content_type(headers)} file."

        return "I'm not sure how to answer that yet. Try asking 'How many rows?', 'Show me [keyword]', or 'Summarize'."

    def _guess_content_type(self, headers: List[str]) -> str:
        text = " ".join(headers)
        if "email" in text or "user" in text: return "User Directory"
        if "log" in text or "ip" in text: return "Server Log"
        if "product" in text or "price" in text: return "Inventory"
        return "General Data"
