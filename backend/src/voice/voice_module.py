from nest.core import Module
from .voice_controller import VoiceController
from .voice_service import VoiceService


@Module(
    controllers=[VoiceController],
    providers=[VoiceService],
    imports=[]
)   
class VoiceModule:
    pass

    