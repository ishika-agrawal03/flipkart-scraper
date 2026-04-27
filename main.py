from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/mobiles")
def get_mobiles(max_price : int=None, min_rating: float=None,sort_price: str=None,popularity: str=None):
    conn=sqlite3.connect("data.db")
    cursor=conn.cursor()
        
    query="SELECT* FROM mobiles"
    params=[]
        

    if max_price and min_rating:
        query+=" WHERE price <= ? AND rating >= ?"
        params=[max_price,min_rating]
        
    elif max_price:
        query+=" WHERE price <= ?"
        params=[max_price]

    elif min_rating:
        query+=" WHERE rating >= ?"
        params=[min_rating]

    if sort_price=="low":
        query +=" ORDER BY price ASC"
        
    elif sort_price=="high":
        query +=" ORDER BY price DESC"

    elif popularity=="high":
        query +=" ORDER BY rating DESC"

    cursor.execute(query,params)
    rows=cursor.fetchall()
    conn.close()

    data=[]

    for row in rows:
        data.append({
            "name":row[0],
            "price":row[1],
            "rating":row[2],
            "image":row[3]
        })
    return data