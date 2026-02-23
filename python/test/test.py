import sys
import os
var = 0
def test():
    print("test var")
    #global var
    #var = var + 1
    print(var)
    test2()
    #assert var == 1

def test2():
    print(f"test2 var")
    #global var
    #var = var + 1
    print(var)
    #assert var == 2
#var = 0
print (__name__)
if __name__ == "__main__":
    sys.path.append(os.getcwd())
    script = """
from test import test, test2
test()
test2()
print("main")"""
    namespace = {}
    print("执行脚本")
    exec(script, namespace)

    print(namespace.keys())
    #test()
    #test()
    #print("main")
