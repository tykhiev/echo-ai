
from nest.core import Injectable


@Injectable
class AppService:
    def __init__(self):
        self.app_name = "Echo AI API"
        self.app_version = "1.0.0"

    def get_app_info(self):
        return {"app_name": self.app_name, "app_version": self.app_version}

