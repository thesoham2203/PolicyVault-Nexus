# import os
# import httpx
# from dotenv import load_dotenv

# load_dotenv()

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")

# headers = {
#     "apikey": SERVICE_ROLE_KEY,
#     "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
#     "Content-Type": "application/json"
# }

# # In supabase.py
# async def test_connection():
#     async with httpx.AsyncClient() as client:
#         res = await client.get(
#             f"{SUPABASE_URL}/rest/v1/",
#             headers=headers
#         )
#         return res.status_code == 200

# # async def get_phone_from_account(account_number: str) -> str | None:
# #     """
# #     Find phone number linked to given account number.
# #     Joins 'accounts' → 'customers' via foreign key.
# #     """
# #     async with httpx.AsyncClient() as client:
# #         # Step 1: Get customer_id from account
# #         acc_res = await client.get(
# #             f"{SUPABASE_URL}/rest/v1/accounts",
# #             headers=headers,
# #             params={
# #                 "account_number": f"eq.{account_number}",
# #                 "select": "customer_id",
# #                 "limit": 1
# #             }
# #         )

# #         if not acc_res.status_code == 200 or not acc_res.json():
# #             return None

# #         customer_id = acc_res.json()[0]["customer_id"]

# #         # Step 2: Use customer_id to get phone
# #         cust_res = await client.get(
# #             f"{SUPABASE_URL}/rest/v1/customers",
# #             headers=headers,
# #             params={
# #                 "id": f"eq.{customer_id}",
# #                 "select": "phone_number",
# #                 "limit": 1
# #             }
# #         )

# #         if not cust_res.status_code == 200 or not cust_res.json():
# #             return None

# #         # # return cust_res.json()[0]["phone"]
# #         # phone = response.json()[0].get("phone_number")
# #         # return phone if phone else None

# async def get_phone_from_account(account_number: str) -> str | None:
#     """
#     Step 1: Find customer_id from account_number in 'accounts'
#     Step 2: Use that customer_id to get phone from 'customers'
#     """
#     async with httpx.AsyncClient() as client:
#         # Step 1: Get customer_id from account_number
#         acc_res = await client.get(
#             f"{SUPABASE_URL}/rest/v1/accounts",
#             headers=headers,
#             params={
#                 "account_number": f"eq.{account_number}",
#                 "select": "customer_id",
#                 "limit": 1
#             }
#         )

#         if acc_res.status_code != 200 or not acc_res.json():
#             print("Account not found")
#             return None

#         customer_id = acc_res.json()[0].get("customer_id")
#         if not customer_id:
#             print("Customer ID missing in account record")
#             return None

#         # Step 2: Get phone from customers using customer_id
#         cust_res = await client.get(
#             f"{SUPABASE_URL}/rest/v1/customers",
#             headers=headers,
#             params={
#                 "id": f"eq.{customer_id}",
#                 "select": "phone_number",
#                 "limit": 1
#             }
#         )

#         if cust_res.status_code != 200 or not cust_res.json():
#             print("Customer not found")
#             return None

#         phone = cust_res.json()[0].get("phone")
#         return phone if phone else None

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

async def get_customer_name(account_number: str) -> str | None:
    try:
        async with httpx.AsyncClient() as client:
            # Step 1: Get customer_id from account
            acc_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/accounts",
                headers=headers,
                params={
                    "account_number": f"eq.{account_number}",
                    "select": "customer_id",
                    "limit": 1
                }
            )

            if acc_res.status_code != 200 or not acc_res.json():
                return None

            customer_id = acc_res.json()[0]["customer_id"]

            # Step 2: Get name from customers
            cust_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/customers",
                headers=headers,
                params={
                    "id": f"eq.{customer_id}",
                    "select": "customer_name",
                    "limit": 1
                }
            )

            if cust_res.status_code != 200 or not cust_res.json():
                return None
            
            return cust_res.json()[0]["customer_name"]

    except Exception as e:
        print(f"Error fetching customer name: {str(e)}")
        return None

async def get_customer_id(account_number: str) -> str | None:
    try:
        async with httpx.AsyncClient() as client:
            # Step 1: Get customer_id from account
            acc_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/accounts",
                headers=headers,
                params={
                    "account_number": f"eq.{account_number}",
                    "select": "customer_id",
                    "limit": 1
                }
            )

            if acc_res.status_code != 200 or not acc_res.json():
                return None

            customer_id = acc_res.json()[0]["customer_id"]
            
            return customer_id

    except Exception as e:
        print(f"Error fetching customer id: {str(e)}")
        return None


async def get_phone_from_account(account_number: str) -> str | None:
    """
    Find phone number linked to given account number and format it with +91 prefix.
    Returns None if phone number is invalid or not found.
    """
    async with httpx.AsyncClient() as client:
        try:
            # Step 1: Get customer_id from account
            acc_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/accounts",
                headers=headers,
                params={
                    "account_number": f"eq.{account_number}",
                    "select": "customer_id",
                    "limit": 1
                }
            )

            if not acc_res.status_code == 200 or not acc_res.json():
                return None

            customer_id = acc_res.json()[0]["customer_id"]

            # Step 2: Get phone number
            cust_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/customers",
                headers=headers,
                params={
                    "id": f"eq.{customer_id}",
                    "select": "phone_number",
                    "limit": 1
                }
            )

            if not cust_res.status_code == 200 or not cust_res.json():
                return None

            phone_number = cust_res.json()[0]["phone_number"]

            # Clean and format phone number
            if not phone_number:
                return None

            # Remove all non-digit characters
            cleaned = ''.join(filter(str.isdigit, str(phone_number)))

            # Handle cases where number might already have +91
            if cleaned.startswith('91') and len(cleaned) == 12:
                cleaned = cleaned[2:]
            elif cleaned.startswith('+91'):
                cleaned = cleaned[3:]

            # Ensure we have 10 digits
            if len(cleaned) != 10:
                return None

            # Return formatted number
            return f"+91{cleaned}"

        except Exception as e:
            print(f"Error fetching phone number: {str(e)}")
            return None