from pymongo import MongoClient
from datetime import datetime, timedelta

client = MongoClient('192.168.99.100', 27017)

db = client['Hotels']
proxy_db = client['IpProxy']

hotels = db['hotel']
cities = db['cities']
tasks = db['tasks']
tasks.create_index([('bulkId', 1), ('taskId', 1)], unique=True)

proxies = proxy_db['proxies']


def saveHotels(hotel):
    hotels.update_one({'HotelId': hotel['HotelId']}, {'$set': hotel}, upsert=True)
    pass


def getCityIdList():
    cityIdList = [city['cityId'] for city in cities.find()]
    return cityIdList


def initTask(cityId, checkInTs, pageSize=45, pageNumber=1):
    taskId = f'{cityId}-{checkInTs}'
    bulkId = datetime.now().strftime('%Y%m%d%H')
    task = {
        'taskId': taskId,
        'bulkId': bulkId,
        'cityId': cityId,
        'checkIn': checkInTs,
        'pageSize': pageSize,
        'pageNumber': pageNumber,
        'isDone': False
    }
    return tasks.update_one({'bulkId': bulkId, 'taskId': taskId}, {'$set': task}, upsert=True)


def bulkInitTasks(cityId, startDate, endDate, pageSize=45, pageNumber=1):
    bulkId = datetime.now().strftime('%Y%m%d%H')
    taskList = []
    while startDate <= endDate:
        taskId = f'{cityId}-{startDate.timestamp()}'
        task = {
            'taskId': taskId,
            'bulkId': bulkId,
            'cityId': cityId,
            'checkIn': startDate.timestamp(),
            'pageSize': pageSize,
            'pageNumber': pageNumber,
            'isDone': False
        }
        taskList.append(task)
        startDate += timedelta(days=1)
    try:
        tasks.insert_many(taskList, ordered=False)
    except:
        pass


def updateTask(taskId, checkInTs, pageSize, pageNumber, isDone=False):
    updateData = {
        'checkIn': checkInTs,
        'pageSize': pageSize,
        'pageNumber': pageNumber,
        'isDone': isDone
    }
    return tasks.update_one({
        'taskId': taskId,
    }, {'$set': updateData})


def findTaskById(taskId):
    return tasks.find_one({'taskId': taskId, 'isDone': False})


def findAllTodoTasks(limit):
    return [city for city in tasks.find({'isDone': False}).limit(limit)]


def deleteTaskById(taskId):
    return tasks.delete_one({'taskId': taskId})


def get_sample_proxies(num):
    return [proxy for proxy in proxies.aggregate([{'$match': {'isValid': True}}, {'$sample': {'size': num}}])]

def get_all_proxies():
    return [proxy for proxy in proxies.aggregate([{'$match': {'isValid': True}}])]
