from .voice_model import Voice
from nest.core import Injectable


@Injectable
class VoiceService:

    def __init__(self):
        self.database = []
        
    def get_voice(self):
        return self.database
    
    def add_voice(self, voice: Voice):
        self.database.append(voice)
        return voice
