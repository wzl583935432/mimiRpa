# ui_ws_watcher.py
import asyncio
import threading
import time
import json
import sys
import traceback

import tkinter as tk
from tkinter import Canvas

import win32api
from pynput import mouse
import uiautomation as auto
import websockets

# -------- CONFIG --------
WEBSOCKET_HOST = '0.0.0.0'
WEBSOCKET_PORT = 8765
MOUSE_POLL_INTERVAL = 1.0  # seconds
RECT_BORDER_WIDTH = 3
RECT_PAD = 2  # padding around control rect
# ------------------------

class Overlay:
    """
    Tk overlay that draws a red border around a rectangle.
    Thread-safe interface: call update_rect(x,y,w,h) from any thread.
    """
    def __init__(self):
        self.root = tk.Tk()
        # no window decoration
        self.root.overrideredirect(True)
        self.root.attributes('-topmost', True)
        # choose a transparency color (windows): make white transparent
        self.root.configure(bg='white')
        try:
            self.root.attributes('-transparentcolor', 'white')
        except Exception:
            # older tkinter might not support transparentcolor; fall back to low alpha
            self.root.attributes('-alpha', 0.4)

        # full-screen small canvas initially
        self.canvas = Canvas(self.root, bg='white', highlightthickness=0)
        self.canvas.pack(fill='both', expand=True)
        self.rect_id = None
        self.visible = False
        self.current_geom = (0,0,1,1)
        # hide window initially by moving off-screen small
        self.root.geometry('1x1+0+0')
        # ensure clicks pass through? Not reliably; we will not block clicks ideally.
        # Note: making truly click-through requires WS_EX_LAYERED/WS_EX_TRANSPARENT via Win32 API.
        # Keeping simple: overlay is topmost but small and updated to control bounds.

    def _draw(self, x, y, w, h):
        # internal: runs in main thread
        if w <= 0 or h <= 0:
            self.hide()
            return
        # position window exactly at control rect (+padding) and draw rectangle inside
        px = max(0, x - RECT_PAD)
        py = max(0, y - RECT_PAD)
        pw = max(1, w + RECT_PAD*2)
        ph = max(1, h + RECT_PAD*2)
        geom = f"{pw}x{ph}+{px}+{py}"
        if geom != getattr(self, '_last_geom', None):
            self.root.geometry(geom)
            self._last_geom = geom
        # resize canvas
        self.canvas.config(width=pw, height=ph)
        # clear previous
        if self.rect_id:
            self.canvas.delete(self.rect_id)
            self.rect_id = None
        # draw rectangle covering canvas border
        self.rect_id = self.canvas.create_rectangle(
            RECT_PAD, RECT_PAD, pw-RECT_PAD, ph-RECT_PAD,
            width=RECT_BORDER_WIDTH, outline='red'
        )
        if not self.visible:
            self.root.deiconify()
            self.visible = True

    def update_rect(self, x, y, w, h):
        # schedule _draw on main thread
        self.current_geom = (x,y,w,h)
        try:
            self.root.after(0, lambda: self._draw(x,y,w,h))
        except Exception:
            pass

    def hide(self):
        # schedule hide on main thread
        def _h():
            try:
                self.root.withdraw()
            except Exception:
                pass
            self.visible = False
        try:
            self.root.after(0, _h)
        except Exception:
            pass

    def mainloop(self):
        try:
            self.root.mainloop()
        except Exception:
            traceback.print_exc()

# Helper: get control info safely
def get_control_info_at_point(x, y):
    try:
        ctrl = auto.ControlFromPoint(x, y)
        if ctrl is None:
            return None
        # bounding rectangle: try multiple possible attributes
        rect = None
        # uiautomation.Control has .BoundingRectangle (returns tuple) or .BoundingRectangle property in some versions.
        try:
            br = ctrl.BoundingRectangle  # usually (left, top, right, bottom)
            if br:
                left, top, right, bottom = br
                rect = (int(left), int(top), int(right-left), int(bottom-top))
        except Exception:
            try:
                r = ctrl.Rect  # earlier convo used Rect
                # r may be a rect-like object with left, top, right, bottom or tuple
                if hasattr(r, 'left'):
                    rect = (int(r.left), int(r.top), int(r.right - r.left), int(r.bottom - r.top))
                elif isinstance(r, (tuple, list)) and len(r) >= 4:
                    left, top, right, bottom = r[:4]
                    rect = (int(left), int(top), int(right-left), int(bottom-top))
            except Exception:
                rect = None
        info = {
            'Name': getattr(ctrl, 'Name', '') or ctrl.Name if hasattr(ctrl, 'Name') else '',
            'AutomationId': getattr(ctrl, 'AutomationId', '') if hasattr(ctrl, 'AutomationId') else '',
            'ControlType': getattr(ctrl, 'ControlTypeName', '') if hasattr(ctrl, 'ControlTypeName') else getattr(ctrl, 'ControlType', ''),
            'ClassName': getattr(ctrl, 'ClassName', '') if hasattr(ctrl, 'ClassName') else '',
            'Rect': rect
        }
        return info
    except Exception:
        # sometimes ControlFromPoint throws; ignore and return None
        return None

# Worker that polls mouse and updates overlay
class UIWatcher:
    def __init__(self, overlay: Overlay):
        self.overlay = overlay
        self._stop_event = threading.Event()
        self._running = False
        self._lock = threading.Lock()
        self.mouse_listener = None

    def start(self):
        with self._lock:
            if self._running:
                return
            self._stop_event.clear()
            self._running = True
            # start mouse click listener in separate thread so we can detect left/right clicks
            self.mouse_listener = mouse.Listener(on_click=self._on_click)
            self.mouse_listener.start()
            # start polling thread
            t = threading.Thread(target=self._poll_loop, daemon=True)
            t.start()

    def stop(self):
        with self._lock:
            self._stop_event.set()
            if self.mouse_listener:
                try:
                    self.mouse_listener.stop()
                except Exception:
                    pass
                self.mouse_listener = None
            self._running = False
            self.overlay.hide()

    def _poll_loop(self):
        try:
            while not self._stop_event.is_set():
                x, y = win32api.GetCursorPos()
                info = get_control_info_at_point(x, y)
                if info and info.get('Rect'):
                    rx, ry, rw, rh = info['Rect']
                    self.overlay.update_rect(rx, ry, rw, rh)
                else:
                    # hide overlay when no control found
                    self.overlay.hide()
                # sleep interval
                for _ in range(int(MOUSE_POLL_INTERVAL / 0.1) if MOUSE_POLL_INTERVAL >= 0.1 else 1):
                    if self._stop_event.wait(0.1):
                        break
        except Exception:
            traceback.print_exc()
        finally:
            self._running = False

    def _on_click(self, x, y, button, pressed):
        # only handle click-down events (pressed == True)
        if not pressed:
            return
        try:
            if button == mouse.Button.left:
                # left click: print control info to console
                info = get_control_info_at_point(x, y)
                if info:
                    print("==== Control Info ====")
                    print(f"Name: {info.get('Name')}")
                    print(f"AutomationId: {info.get('AutomationId')}")
                    print(f"ControlType: {info.get('ControlType')}")
                    print(f"ClassName: {info.get('ClassName')}")
                    print(f"Rect: {info.get('Rect')}")
                    print("======================")
                else:
                    print("No control found at point:", (x,y))
            elif button == mouse.Button.right:
                # right click: stop watcher
                print("Right click received -> stopping watcher.")
                self.stop()
        except Exception:
            traceback.print_exc()

# WebSocket server
class WSControlServer:
    def __init__(self, watcher: UIWatcher):
        self.watcher = watcher
        self._server = None
        self._loop = None
        self._thread = None

    async def handler(self, websocket, path):
        # simple protocol: expect JSON or plain text 'start'/'stop'
        async for message in websocket:
            msg = message.strip()
            # try parse json if possible
            try:
                data = json.loads(msg)
            except Exception:
                data = msg
            if isinstance(data, str):
                cmd = data.lower()
                if cmd == 'start':
                    print("WebSocket: start received")
                    self.watcher.start()
                    await websocket.send("started")
                elif cmd == 'stop':
                    print("WebSocket: stop received")
                    self.watcher.stop()
                    await websocket.send("stopped")
                else:
                    await websocket.send(f"unknown command: {data}")
            elif isinstance(data, dict):
                cmd = data.get('cmd') or data.get('command') or ''
                if cmd.lower() == 'start':
                    self.watcher.start()
                    await websocket.send("started")
                elif cmd.lower() == 'stop':
                    self.watcher.stop()
                    await websocket.send("stopped")
                else:
                    await websocket.send("unknown dict command")
            else:
                await websocket.send("unsupported message format")

    def start_in_thread(self, host=WEBSOCKET_HOST, port=WEBSOCKET_PORT):
        def _run_loop():
            self._loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self._loop)
            start_server = websockets.serve(self.handler, host, port)
            print(f"WebSocket server starting on ws://{host}:{port}")
            self._server = self._loop.run_until_complete(start_server)
            try:
                self._loop.run_forever()
            finally:
                # close
                self._loop.run_until_complete(self._server.wait_closed())
                self._loop.close()
        t = threading.Thread(target=_run_loop, daemon=True)
        t.start()
        self._thread = t

    def stop(self):
        if self._loop:
            self._loop.call_soon_threadsafe(self._loop.stop)

# ---- main ----
def main():
    overlay = Overlay()
    watcher = UIWatcher(overlay)
    ws_server = WSControlServer(watcher)
    ws_server.start_in_thread()

    print("WebSocket server running. Send 'start' to start watcher, 'stop' to stop.")
    print(f"Example (JS): ws = new WebSocket('ws://localhost:{WEBSOCKET_PORT}'); ws.onopen = ()=>ws.send('start');")

    # run Tk mainloop (blocks main thread)
    try:
        overlay.mainloop()
    except KeyboardInterrupt:
        print("Exiting...")
    finally:
        watcher.stop()
        ws_server.stop()

if __name__ == '__main__':
    main()
