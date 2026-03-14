# import redis.asyncio as redis
# import logging
# from app.config.config import settings

# logger = logging.getLogger(__name__)

# # Main Redis client
# redis_client = redis.Redis(
#     host=settings.REDIS_HOST,
#     port=settings.REDIS_PORT,
#     password=settings.REDIS_PASSWORD,
#     decode_responses=True
# )

# # Publisher and Subscriber
# redis_publisher = redis_client
# redis_subscriber = redis_client


# async def connect_redis():
#     """
#     Connect to Redis server
#     """
#     try:
#         await redis_client.ping()
#         logger.info("Redis connected successfully")

#     except Exception as e:
#         logger.error(f"Redis connection failed: {str(e)}")
#         raise e


# async def disconnect_redis():
#     """
#     Disconnect from Redis server
#     """
#     try:
#         await redis_client.close()
#         logger.info("Redis disconnected")

#     except Exception as e:
#         logger.error(f"Error disconnecting from Redis: {str(e)}")