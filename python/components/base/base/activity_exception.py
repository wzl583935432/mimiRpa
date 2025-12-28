from common.exception.biz_exception import BIZException

class ActivityException(BIZException):
    def __init__(self, message, error_code=None):
        super().__init__(message) # Initialize the base Exception with the message
        self.error_code = error_code # Add a custom attribute for tracking
    pass