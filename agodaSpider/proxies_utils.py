from model import *
import multiprocessing
import random
import time

# 代理服务器
proxyHost = "dyn.horocn.com"
proxyPort = "50000"

# 代理隧道验证信息
proxyUser = "Z9VR1650416917884074"
proxyPass = "CdX7ixFgtDPd"

class ProxiesUtils:
    def __init__(self):
        self.ProxiesDict = {}
        #self.lock = lock
        self.init()

    def getProxy(self):
        #with self.lock:
        # for url, ts in self.ProxiesDict.items():
        #     now = time.time()
        #     if now - ts > 2:
        #         self.ProxiesDict[url] = now
        #         return {
        #             'http': url,
        #             'https': url
        #         }
        # time.sleep(2)
        proxyMeta = "http://%(user)s:%(pass)s@%(host)s:%(port)s" % {
            "host": proxyHost,
            "port": proxyPort,
            "user": proxyUser,
            "pass": proxyPass,
        }
        return {
            'http': proxyMeta,
            'https': proxyMeta
        }

    def init(self):
        proxies = model.get_all_proxies()
        now = time.time()
        for proxy in proxies:
            proxyUrl = f'{proxy["protocol"]}://{proxy["ip"]}:{proxy["port"]}'
            self.ProxiesDict[proxyUrl] = now;
