from nest.core import PyNestFactory, Module
from .app_controller import AppController
from .app_service import AppService
from src.voice.voice_module import VoiceModule


@Module(imports=[VoiceModule], controllers=[AppController], providers=[AppService])
class AppModule:
    pass


app = PyNestFactory.create(
    AppModule,
    description="Echo AI API",
    title="Echo AI API",
    version="1.0.0",
    debug=True,
)
http_server = app.get_server()
