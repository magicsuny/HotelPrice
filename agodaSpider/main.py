from cityHotelsCrawler import CityHotelsCrawler
from model import *
import multiprocessing
from multiprocessing.managers import BaseManager
import asyncio
from time import sleep, time
from datetime import datetime, timedelta
import sys
from proxies_utils import ProxiesUtils
from functools import partial

multiprocessing.set_start_method('spawn', True)
workerNum = 5
loop = asyncio.get_event_loop()

def exeTime(func):
    def newFunc(*args, **args2):
        t0 = time()
        back = func(*args, **args2)
        print("@%.3fs taken for {%s}" % (time() - t0, func.__name__))
        return back

    return newFunc


def fetchHotelsByTask(crawler):
    # checkIn = datetime.fromtimestamp(task['checkIn'])
    # crawler = CityHotelsCrawler(cityId=task['cityId'], checkIn=checkIn, pageSize=task['pageSize'],
    #                             pageNumber=task['pageNumber'], proxy=proxyUtils)
    crawler.doRequest()


def checkTodoTask():
    taskList = model.findAllTodoTasks()
    results = pool.map(fetchHotelsByTask, taskList)


@exeTime
def preGenerateTask():
    print(f'预处理任务开始 bulkId:{datetime.now().strftime("%Y%m%d%H")}')
    cityIdList = model.getCityIdList()
    for cityId in cityIdList:
        # 明天开始
        startDate = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        endDate = startDate + timedelta(days=30)
        model.bulkInitTasks(cityId, startDate, endDate)
    print(f'预处理任务结束 bulkId:{datetime.now().strftime("%Y%m%d%H")}')


def getHexStrMode(hex_str, mode_num):
    str_len = len(hex_str)
    result_mod = 0
    for idx, ch in enumerate(hex_str):
        result_mod = (result_mod * 16 + int(ch, 16)) % mode_num

    return result_mod


class MyManager(BaseManager): pass


def Manager():
    m = MyManager()
    m.start()
    return m


if __name__ == '__main__':
    # MyManager.register('ProxiesUtils', ProxiesUtils)
    # manager = Manager()
    # proxyUtils = manager.ProxiesUtils()
    #global lock
    #lock = multiprocessing.Lock()
    proxyUtils = ProxiesUtils()
    try:
        initFlag = sys.argv[-1]
        if initFlag == 'init':
            preGenerateTask()

        while True:
            # 一次查询一百个任务
            taskList = model.findAllTodoTasks(10 * workerNum)
            if len(taskList) == 0:
                break
            crawlers = [];
            for task in taskList:
                checkIn = datetime.fromtimestamp(task['checkIn'])
                crawler = CityHotelsCrawler(cityId=int(task['cityId']), checkIn=checkIn, pageSize=int(task['pageSize']),
                                            pageNumber=int(task['pageNumber']), proxy=proxyUtils)
                crawlers.append(crawler)
            with multiprocessing.Pool(processes=workerNum) as pool:
                results = pool.map(fetchHotelsByTask, crawlers)
                # subTaskList = [taskList[i:i + 100] for i in range(0, len(taskList), 100)]
                # for task in taskList:
            # pool = multiprocessing.Pool(processes=workerNum)
            # results = [pool.apply_async(func=fetchHotelsByTask, args=(crawler)) for crawler in crawlers]
            # pool.close()
            # pool.join()
        print('All task Done')
        sys.exit(0)
    except Exception as argument:
        print('Program is dead.', argument)
        sys.exit(-1);
    finally:
        print('clean-up')
