import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

db_pool = None
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_PORT = os.getenv("DB_PORT")

async def connect_db():
    global db_pool 
    db_pool = await asyncpg.create_pool(
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_DATABASE,
        host=DB_HOST, 
        port=DB_PORT
    )
    print("✔Conexión con el pool establecida")

async def close_db():
    global db_pool
    if db_pool is not None:
        await db_pool.close()
        print("❌Conexión con el pool cerrada")