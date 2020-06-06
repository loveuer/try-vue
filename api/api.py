from fastapi import FastAPI

app = FastAPI()


@app.get('/api/user')
def getUser():
    userName = "loveuer"
    userAge = 29
    userAddress = "Chengdu"
    userLikeFood = "noodle"
    userLikeColor = "lightblue"
    return {"name": userName, "age": userAge, "address": userAddress, "like": {"food": userLikeFood, "color": userLikeColor}}
