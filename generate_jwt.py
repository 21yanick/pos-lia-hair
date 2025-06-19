#!/usr/bin/env python3
import jwt
import json
from datetime import datetime, timedelta

# JWT Secret from Supabase
JWT_SECRET = "7uSIAsn8k2eWJi30IKwZy6BAY8BjiOSu"

# Generate anon token
anon_payload = {
    "role": "anon",
    "iss": "supabase",
    "iat": int(datetime.now().timestamp()),
    "exp": int((datetime.now() + timedelta(days=365*10)).timestamp())  # 10 years
}

# Generate service_role token
service_payload = {
    "role": "service_role", 
    "iss": "supabase",
    "iat": int(datetime.now().timestamp()),
    "exp": int((datetime.now() + timedelta(days=365*10)).timestamp())  # 10 years
}

anon_token = jwt.encode(anon_payload, JWT_SECRET, algorithm="HS256")
service_token = jwt.encode(service_payload, JWT_SECRET, algorithm="HS256")

print("# NEW CORRECT JWT TOKENS")
print(f"NEXT_PUBLIC_SUPABASE_ANON_KEY={anon_token}")
print(f"SUPABASE_SERVICE_ROLE_KEY={service_token}")