from common.exception.sys_exception import SYSException
from loguru import logger
from ..biz.engine_service import EngineService
class EngineController:
    route = {} 
    def __init__(self):
        self.route["start_workflow"] = self.start_workflow
        pass

    async def start_workflow(self, socket, msg):
        try:
            logger.info(msg)
            logger.info("***** start_workflow", msg)
            await EngineService().get_instance().start_run_workflow(msg)
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
