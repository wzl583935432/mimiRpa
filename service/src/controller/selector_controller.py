from common.exception.sys_exception import SYSException
from loguru import logger
from uiAutomation.ui_automation_select import UIAutomationSelect
import threading
from uiAutomation.model.call_info import CallInfo
class SelectController:
    route = {}
    def __init__(self):
        self.route["select_element"] = self.do_select_element

    async  def do_select_element(self, socket, msg):
        logger.info("start select element")
        au = UIAutomationSelect()
        call_info = CallInfo("select_element")
        au.start_select_element_target(call_info)
        call_info.response_event.wait()
        return call_info.responseData
        

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