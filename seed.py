import random
import faker
import psycopg2
import datetime

GUEST_NUM = [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 5, 5, 6, 7, 8, 9]
CUST_NUM = 100

fake = faker.Faker()

connection = psycopg2.connect("postgresql://localhost:5433:/joel")
cursoor = connection.cursor()

cursoor.execute("TRUNCATE customers RESTART IDENTITY CASCADE")

for rn in range(CUST_NUM):
    pNumber = fake.phone_number() if random.random() < .5 else None
    notes = fake.sentence() if random.random() < .3 else ""
    firstnm = fake.first_name()
    lastnm = fake.last_name()
    cursoor.execute("INSERT INTO customers (first_name, last_name, phone, notes)"
                 " VALUES (%s, %s, %s, %s)", (firstnm, lastnm, pNumber, notes))

now = datetime.datetime.now()

for rn in range(2 * CUST_NUM):
    custid = random.randint(1, CUST_NUM)

    start = fake.date_time_this_year(after_now=True)
    GUEST_NUM = random.choice(GUEST_NUM)
    notes = fake.sentence() if random.random() < .3 else ""

    cursoor.execute("INSERT INTO reservations"
                 " (customer_id, GUEST_NUM, start_at, notes)"
                 " VALUES (%s, %s, %s, %s)",
                 (custid, GUEST_NUM, start, notes))

connection.commit()
