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