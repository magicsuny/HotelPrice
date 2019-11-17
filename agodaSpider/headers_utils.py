from fake_useragent import UserAgent
import random

user_agent = UserAgent(use_cache_server=False)


def generate_headers():
	return {
		'origin': 'https://www.agoda.com',
		'accept-encoding': 'gzip, deflate, br',
		'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6',
		'user-agent': user_agent.random,
		'content-type': 'application/json; charset=UTF-8',
		'accept': 'application/json',
		'authority': 'www.agoda.com',
		'x-requested-with': 'XMLHttpRequest',
		'dnt': '1',
	}

def getRandomProxy(proxies):
	randProxy = random.choice(proxies)
	if not randProxy:
		return None
	proxyUrl = f'{randProxy["protocol"]}://{randProxy["ip"]}:{randProxy["port"]}'
	return {
		'http':proxyUrl,
		'https':proxyUrl
	}
