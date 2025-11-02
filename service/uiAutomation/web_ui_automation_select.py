import psutil
import os
import json
from playwright.async_api import async_playwright
import threading
import asyncio
import uuid
import queue
from queue import Empty
from web_operation import ChromeOperation
from dataclasses import dataclass
from typing import Optional
from loguru import logger
import traceback

@dataclass
class CallInfo:
    def  __init__(self, messageCode, config, requestData= None):
        self.messgeId = uuid.uuid4()
        self.messageCode = messageCode
        self.requestData = requestData
        self.responseData = None
        self.response_event = threading.Event()
        self.config = config

    messgeId:str
    messageCode:str
    requestData:str
    responseData:str
    responseCode:str
    response_event:threading.Event
    config = {}


class WebUIAutomationSelect:
    _instance = None
    _lock = threading.Lock()
    _web_config = {}
    _request_queue = queue.Queue()
    _current_playwright = None
    _web_contents = {}
    _playwright_thread = None
    _request_event = asyncio.Event()

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def init_run(self):
        if None != self._playwright_thread:
            return
        self._init_config()
        # 2. 启动 Playwright 线程
        self._playwright_thread = threading.Thread(target=self.playwright_thread_entry)
        self._playwright_thread.start()
        
        pass

    def playwright_thread_entry(self):
        """线程的入口函数，启动 asyncio 事件循环"""
        # 启动异步事件循环，运行我们的核心异步函数
        asyncio.run(self._playwright_worker())

    async def _playwright_worker(self):
        """在独立线程中运行的 Playwright 工作函数"""
        print("Playwright 线程启动...")

        # Playwright 所有的代码都必须在这个 with 块内（即同一个线程内）
        async with async_playwright() as p:
            try:
                print('async_playwright---')
                self._current_playwright = p
                # --- 主循环：等待并处理请求 ---
                while True:
                    request_object: CallInfo = None
                    try:
                        request_object = self._request_queue.get()
                    except Empty as e:
                        await self._request_event.wait()
                        continue
                    print('get callInfo---')
                    try:
                        if not request_object:
                            continue
                        if request_object.messageCode == "viewport":
                            print('playwright 处理view port')
                            result = await self._get_view_port(request_object.config)
                            request_object.responseData = result
                            request_object.response_event.set()
                        elif request_object.messageCode == 'start_select_element_target':
                            print('pstart_select_element_target')
                            await self._start_select_element_target(request_object.config)
                            pass
                        elif request_object.messageCode == 'stop_select_element_target':
                            print('stop_select_element_target')
                            await self._stop_select_element_target(request_object.config)
                            pass
                    
                    except Exception as e:
                        traceback.print_exc()
                        logger.warning(f"playwright 线程处理异常 {e}")
                        pass
                    finally:
                        self._request_queue.task_done()
                        pass
            except Exception as e:
                print(f"Playwright 线程出错: {e}")
                # 通知等待的线程一个错误
            finally:
                # 确保即使出错，线程也能清理和退出
                print("Playwright 线程退出...")

    def _init_config(self):
        web_config ="web_config.json"
        config_content = '[{"name":"chrome", "port":10245}, {"name":"mimibrowser","port":10242}]'

        if os.path.exists(web_config):
            try:
                with open(web_config, 'r', encoding='utf-8') as f:
                    config_content = f.read()
                    # 2. 使用 json.load() 函数将文件句柄中的 JSON 数据加载到 Python 对象中
            except json.JSONDecodeError as e:
                print(f"错误: JSON 解析失败。请检查文件内容是否是有效的 JSON 格式。详细信息: {e}")
            except Exception as e:
                print(f"发生其他错误: {e}")
        data_list = json.loads(config_content)
        self._web_config ={}
        for item in data_list:
           self._web_config[item['name']] = item
        pass

    async def _get_view_port(self, config):
        if not config:
            return None
        name = config['name']
        if ((not name in self._web_contents)  or (not self._web_contents[name])):
            web_content = self._create_web_operation(config)
            self._web_contents[name] = web_content
            print('creat ui playwright is ok')
        else:
            web_content = self._web_contents[name] 
        if not web_content:
            print('get web content error!')
            return None

        view_port = await web_content.get_viewport()
        return view_port
    
    async def _start_select_element_target(self, config):
        if not config:
            return None
        name = config['name']
        if ((not name in self._web_contents)  or (not self._web_contents[name])):
            return
        web_content = self._web_contents[name] 
        if not web_content:
            print('get web content error!')
            return None

        await web_content.begin_select_element()

    async def _stop_select_element_target(self, config):
        if not config:
            return None
        name = config['name']
        if ((not name in self._web_contents)  or (not self._web_contents[name])):
            return
        web_content = self._web_contents[name] 
        if not web_content:
            print('get web content error!')
            return None

        await web_content.end_select_element()

        
    
    def _playwright_request(self, call_info:CallInfo):
        self._request_queue.put(call_info)
        self._request_event.set()
        pass

    def start_select_element_target(self):
        print('web----')
        for config in self._web_config.values():
            call_info =  CallInfo('start_select_element_target', config) 
            self._playwright_request(call_info=call_info)
        
        pass

    def stop_all_select_element_target(self):
        for config in self._web_config:
            call_info =  CallInfo('stop_select_element_target', config) 
            self._playwright_request(call_info=call_info)
            pass
        
        pass


    def is_web_control(self, control, x, y):
        process_name = self._get_process_name(control)
        print(f'process_name {process_name}')
        if (not process_name in self._web_config):
            return False
        config = self._web_config[process_name]
        if not config:
            return False
        print('web----')

        call_info =  CallInfo('viewport', config) 
        self._playwright_request(call_info=call_info)
        event_set = call_info.response_event.wait(timeout=15)
        
        if not event_set:
            logger.warning(f'viewport 请求超时')
            return False
        
        view_port = call_info.responseData
        if not view_port:
            print('get view port error')
            return False

        print(f'viewport  x {view_port['x']} y {view_port['y']} width {view_port['width']} height {view_port['height']}')
        if (view_port['x'] < x and 
            view_port['y'] < y and 
            x < view_port['x'] + view_port['width'] and 
            y < view_port['y'] + view_port['height']):
            print("鼠标在web中")
            return True
        return False
        

    def _create_web_operation(self, config):
        name = config['name']
        if name == 'chrome' or name == 'mimibrowser' :
            return ChromeOperation(self._current_playwright, config['port'])
        return None
    

    def _get_process_name(self, control):
        try:
            process = psutil.Process(control.ProcessId)
            process_name = process.name().lower()
            process_name = process_name.removesuffix(".exe")
            return process_name
        except Exception:
            pass
        return ""
        

    pass