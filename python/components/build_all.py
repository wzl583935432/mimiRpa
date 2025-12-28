# build_all.py
import os
import subprocess

libs = ["libs/lib_auth", "libs/lib_utils"]

for lib in libs:
    print(f"正在编译: {lib}")
    subprocess.run(["python", "-m", "build", lib])