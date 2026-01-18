import google.generativeai as genai
from app.core.config import settings

class GeminiClient:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            print("WARNING: GEMINI_API_KEY not found in settings.")
            return
            
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = None
        self._init_model()

    def _init_model(self):
        try:
            available_models = list(genai.list_models())
            capable_models = [m for m in available_models if 'generateContent' in m.supported_generation_methods]
            
            # Sort to try 'flash' and 'pro' models first as they are usually most stable
            def model_priority(m):
                name = m.name.lower()
                if 'flash' in name: return 0
                if '1.5-pro' in name: return 1
                if 'gemini-pro' in name: return 2
                return 10
            
            capable_models.sort(key=model_priority)
            
            print(f"Found {len(capable_models)} capable models. Testing for availability...")
            
            working_model = None
            for m in capable_models:
                print(f"Testing model: {m.name}...")
                try:
                    # Active probe to check if model actually works (quota/permissions)
                    temp_model = genai.GenerativeModel(m.name)
                    # Use a very short timeout for the probe
                    response = temp_model.generate_content("Hi", generation_config={'max_output_tokens': 1})
                    if response and response.text:
                        print(f"SUCCESS: Model {m.name} is working.")
                        working_model = temp_model
                        self.model_name = m.name
                        break
                except Exception as e:
                    print(f"FAILED: Model {m.name} - {e}")
                    continue
            
            if working_model:
                self.model = working_model
            else:
                print("CRITICAL: No working Gemini model found. AI features will be disabled.")
                self.model = None

        except Exception as e:
            print(f"Failed to list/test models: {e}")
            self.model = None

    async def generate_daily_briefing(self, user_name: str, habits_summary: str, recent_logs: str, goals: str) -> str:
        if not self.model:
            return "AI unavailable (No working model found)."
            
        prompt = f"""
        You are a highly motivating and concise habit coaching AI named HabitOS.
        User: {user_name}
        User Goals: {goals}
        
        Current Habits Context:
        {habits_summary}

        Recent Activity (Last 3 days):
        {recent_logs}

        Task:
        1. Summarize yesterday's progress in 1 short sentence.
        2. Give a specific, punchy focus for today based on their weakest or most critical habit.
        3. End with a very short motivational quote or phrase.
        
        Keep the tone energetic, professional, yet warm. total output should be under 100 words.
        """
        try:
            # We explicitly try/except here to catch model 404s and fallback if needed
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
            # simple fallback if 1.5 flush fails, try gemini-pro on the fly? 
            # For now return error message gracefully
            return "Focus on your goals today! (AI temporarily unavailable)"

    async def generate_action_plan(self, user_name: str, habits_summary: str, goals: str) -> str:
        if not self.model:
            return "AI unavailable (No working model found)."

        prompt = f"""
        Act as an expert Day Planner.
        User: {user_name}
        Goals: {goals}
        Habits to schedule:
        {habits_summary}

        Task:
        Create a realistic, structured daily schedule (morning to evening) that incorporates these habits and works towards the goals.
        
        Format:
        Return a simple Markdown list of time blocks.
        Example:
        - **07:00 AM**: Morning Routine (Habit 1)
        - **09:00 AM**: Deep Work Block
        
        Keep it concise and practical.
        """
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini Plan Error: {e}")
            return "Could not generate plan."

gemini_client = GeminiClient()
