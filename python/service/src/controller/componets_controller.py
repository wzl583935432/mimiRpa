from common.exception.sys_exception import SYSException
from ..assistant.componets_service import ComponetsService
from loguru import logger
class ComponentsController:
    route = {} 
    def __init__(self):
        self.route["get_components_tree"] = self.get_components_tree
        pass

    def get_components_tree(self, socket, msg):
        try:
            return ComponetsService().get_instance().query_components(msg.get('params'))
            ##workflow.start()
        except Exception as e:
            logger.error(f"Failed to start workflow: {e}")
            raise SYSException("Failed to start workflow")

    async def dispatchMessage(self, socket, msg):
        handler = self.route.get(msg.get('requestCode'))
        logger.info('---------dispatchMessage----------')
        if handler:
            logger.info('找到元素选择的函数')
            # 调用业务代码处理消息
            return await handler(socket, msg)
        else:
            raise SYSException("没有处理的消息")
        pass
