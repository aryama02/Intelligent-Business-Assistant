from model.schema import userRegistrationRequest
from db import get_database
from datetime import datetime, timedelta


async def subscribe_user_service(email: str):
    # payment processing logic would go here (e.g., interacting with a payment gateway)
    print(f"--- Processing subscription for {email} ---")
    db_instance = get_database()
    users_collection = db_instance.get_collection("users")
    user_subscription = db_instance.get_collection("subscriptions")
    
    # Renew subscription for existing subscribed users
    existing_subscription = await user_subscription.find_one({"user_email": email})
    if existing_subscription:
        print(f"Found existing subscription for {email}. Renewing...")
        new_end_date = existing_subscription["subscription_end_date"] + timedelta(days=30)
        await user_subscription.update_one(
            {"user_email": email},
            {"$set": {"subscription_end_date": new_end_date}}
        )
        return {"message": "Subscription renewed successfully", "action": "renewed"}
    
    print(f"Creating new subscription for {email}...")
    result = await users_collection.update_one(
        {"email": email}, {"$set": {"isSubscribed": True}}
    )
    
    if result.matched_count == 0:
        print(f"User {email} not found in database.")
        return {"message": "User not found"}

    await user_subscription.insert_one(
        {
            "user_email": email,
            "subscription_end_date": datetime.utcnow() + timedelta(days=30),
        }
    )
    print(f"Subscription created successfully for {email}")
    return {"message": "User subscribed successfully", "action": "created"}