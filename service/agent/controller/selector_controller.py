from common.exception.sys_exception import SYSException
from loguru import logger
class SelectController:
    route = {}
    def __init__(self):
        self.route["select_element"] = self.do_select_element

    async  def do_select_element(self, socket, msg):
        logger.info("start select element")
        pass

    async def dispatchMessage(self, socket, msg):
        handler = self.route.get(msg.get('requestCode'))
        
        if handler:
            # 调用业务代码处理消息
            return await handler(self, socket, msg)
        else:
            raise SYSException("没有处理的消息")
        pass