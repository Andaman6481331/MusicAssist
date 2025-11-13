import os
import replicate

api_token = os.getenv("REPLICATE_API_TOKEN")  # reads the environment variable
client = replicate.Client(api_token=api_token)

models = client.models.list()
for m in models[:20]:  # show first 5
    print(m.name)