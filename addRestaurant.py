import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import json
from pathlib import Path

# Restaurant types
restaurant_types = ["drive_thru", "hybrid", "in_person"]


# Function to add a new restaurant to the restaurants.json file
def add_restaurant(name, type, image, description):
    db_path = Path("restaurant-app/database/restaurants.json")

    if db_path.exists():
        with open(db_path, "r") as file:
            restaurants = json.load(file)
    else:
        restaurants = []

    new_id = max([restaurant["id"] for restaurant in restaurants], default=0) + 1

    new_restaurant = {
        "id": new_id,
        "popularity": 0,
        "name": name,
        "type": type,
        "popularity_multiplier": 0,
        "image": image,
        "description": description,
    }

    restaurants.append(new_restaurant)

    with open(db_path, "w") as file:
        json.dump(restaurants, file, indent=4)

    return new_restaurant


# Function to remove a restaurant by ID
def remove_restaurant(restaurant_id):
    db_path = Path("restaurant-app/database/restaurants.json")

    if db_path.exists():
        with open(db_path, "r") as file:
            restaurants = json.load(file)
    else:
        messagebox.showerror("Error", "The database file does not exist.")
        return

    restaurants = [r for r in restaurants if r["id"] != restaurant_id]

    with open(db_path, "w") as file:
        json.dump(restaurants, file, indent=4)


# GUI
def gui():
    root = tk.Tk()
    root.title("Restaurant Management")

    # Center the application window
    window_width = 400
    window_height = 200
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    x = (screen_width - window_width) // 2
    y = (screen_height - window_height) // 2
    root.geometry(f"{window_width}x{window_height}+{x}+{y}")

    # Add new restaurant
    def add():
        name = simpledialog.askstring("Name", "Enter the restaurant name:", parent=root)
        if not name:
            return
        # Use a Combobox for restaurant type selection
        type_combobox = ttk.Combobox(root, values=restaurant_types)
        type_combobox.set("Select type")
        type_combobox.pack(fill=tk.X, padx=10, pady=5)

        def confirm_type():
            type = type_combobox.get()
            type_combobox.destroy()  # Remove the Combobox
            confirm_button.destroy()  # Remove the Confirm button
            # Continue with asking other details
            image = simpledialog.askstring(
                "Image URL", "Enter the restaurant image URL:", parent=root
            )
            description = simpledialog.askstring(
                "Description", "Enter the restaurant description:", parent=root
            )
            restaurant = add_restaurant(name, type, image, description)
            messagebox.showinfo("Added", f"Added restaurant with ID {restaurant['id']}")

        confirm_button = tk.Button(root, text="Confirm", command=confirm_type)
        confirm_button.pack(fill=tk.X, padx=10, pady=5)

    # Remove restaurant
    def remove():
        restaurant_id = simpledialog.askinteger(
            "ID", "Enter the restaurant ID to remove:", parent=root
        )
        if restaurant_id is not None:
            remove_restaurant(restaurant_id)
            messagebox.showinfo(
                "Removed", f"Removed restaurant with ID {restaurant_id}"
            )

    tk.Button(root, text="Add Restaurant", command=add).pack(fill=tk.X, padx=10, pady=5)
    tk.Button(root, text="Remove Restaurant", command=remove).pack(
        fill=tk.X, padx=10, pady=5
    )

    root.mainloop()


gui()
