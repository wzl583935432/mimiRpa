class SYSException(Exception):
    def __init__(self, message, error_code=None):
        super().__init__(message) # Initialize the base Exception with the message
        self.error_code = error_code # Add a custom attribute for tracking
    pass
    