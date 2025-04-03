from nest.core import Controller, Get, Post
from .voice_service import VoiceService
from .voice_model import Voice


@Controller("voice", tag="voice")
class VoiceController:

    def __init__(self, voice_service: VoiceService):
        self.voice_service = voice_service
    
    @Get("/")
    def get_voice(self):
        return self.voice_service.get_voice()
        
    @Post("/")
    def add_voice(self, voice: Voice):
        return self.voice_service.add_voice(voice)

