import pandas as pd
import sqlite3

# Define the path to your CSV file and database
csv_file = 'expenses.csv'
database_file = 'expenses.db'

# Read the CSV file into a Pandas DataFrame
try:
    expenses_df = pd.read_csv(csv_file)
    print(f"Successfully read '{csv_file}'.")
except FileNotFoundError:
    print(f"Error: The file '{csv_file}' was not found.")
    exit(1)
except Exception as e:
    print(f"An error occurred while reading '{csv_file}': {e}")
    exit(1)

# Connect to the SQLite database
try:
    conn = sqlite3.connect(database_file)
    cursor = conn.cursor()
    print(f"Connected to database '{database_file}'.")
except sqlite3.Error as e:
    print(f"An error occurred while connecting to the database: {e}")
    exit(1)

# Check if the 'individual_expenses' table exists
table_check_query = "SELECT name FROM sqlite_master WHERE type='table' AND name='individual_expenses';"
cursor.execute(table_check_query)
if not cursor.fetchone():
    print("Error: The table 'individual_expenses' does not exist in the database.")
    conn.close()
    exit(1)

# Insert data into the 'individual_expenses' table
try:
    for index, row in expenses_df.iterrows():
        # Prepare the data for insertion
        amount = row['amount']
        vendor = row['vendor']
        date = row['date']
        category = row['category']
        subcategory = row['subcategory']
        description = row['description']

        # Construct the SQL query
        sql = '''
        INSERT INTO individual_expenses (amount, vendor, date, category, subcategory, description)
        VALUES (?, ?, ?, ?, ?, ?)
        '''

        # Execute the query
        cursor.execute(sql, (amount, vendor, date, category, subcategory, description))

    # Commit the changes
    conn.commit()
    print(f"Data from '{csv_file}' has been successfully inserted into 'individual_expenses' table in '{database_file}'.")
except sqlite3.Error as e:
    print(f"An error occurred while inserting data into the database: {e}")
finally:
    # Close the database connection
    conn.close()