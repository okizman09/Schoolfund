import aiosqlite
import os
import json
from datetime import datetime, timezone
import bcrypt
from .config import settings

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

DB_PATH = settings.DATABASE_PATH

async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        # Create tables
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS funds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                public_code TEXT UNIQUE NOT NULL,
                owner_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                target_amount REAL NOT NULL,
                contribution_amount REAL NOT NULL,
                allow_custom_amount INTEGER DEFAULT 0,
                currency TEXT DEFAULT 'NGN',
                deadline TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id)
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS contributions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fund_id INTEGER NOT NULL,
                contributor_name TEXT NOT NULL,
                contributor_email TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'NGN',
                status TEXT NOT NULL,
                provider TEXT DEFAULT 'BMONI_SANDBOX',
                reference_id TEXT UNIQUE NOT NULL,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                FOREIGN KEY (fund_id) REFERENCES funds(id)
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fund_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                recipient_name TEXT,
                recipient_account_number TEXT,
                recipient_bank_name TEXT,
                recipient_bank_code TEXT,
                status TEXT DEFAULT 'pending',
                approved_by INTEGER,
                approved_at TIMESTAMP,
                reference_id TEXT,
                provider TEXT DEFAULT 'BMONI_LIVE',
                metadata TEXT,
                created_by INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (fund_id) REFERENCES funds(id),
                FOREIGN KEY (created_by) REFERENCES users(id),
                FOREIGN KEY (approved_by) REFERENCES users(id)
            );
        """)

        # Dynamic schema migration for existing SQLite database
        cursor = await db.execute("PRAGMA table_info(expenses);")
        raw_rows = await cursor.fetchall()
        columns = [r[1] if isinstance(r, (tuple, list)) else r["name"] for r in raw_rows]
        new_cols = {
            "recipient_name": "TEXT",
            "recipient_account_number": "TEXT",
            "recipient_bank_name": "TEXT",
            "recipient_bank_code": "TEXT",
            "status": "TEXT DEFAULT 'pending'",
            "approved_by": "INTEGER",
            "approved_at": "TIMESTAMP",
            "reference_id": "TEXT",
            "provider": "TEXT DEFAULT 'BMONI_LIVE'",
            "metadata": "TEXT"
        }
        for col, col_type in new_cols.items():
            if col not in columns:
                await db.execute(f"ALTER TABLE expenses ADD COLUMN {col} {col_type};")
        
        # Ensure any pre-existing legacy expenses are marked as settled
        await db.execute("UPDATE expenses SET status = 'success' WHERE status IS NULL;")


        await db.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fund_id INTEGER NOT NULL,
                reference_id TEXT UNIQUE NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'NGN',
                status TEXT NOT NULL,
                provider TEXT NOT NULL,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (fund_id) REFERENCES funds(id)
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                fund_id INTEGER,
                action TEXT NOT NULL,
                metadata TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        await db.commit()

        # Check if demo seed is required
        if settings.DEMO_MODE:
            cursor = await db.execute("SELECT COUNT(*) FROM users;")
            user_count = (await cursor.fetchone())[0]
            if user_count == 0:
                await seed_demo_data(db)

async def seed_demo_data(db: aiosqlite.Connection):
    now = datetime.now(timezone.utc).isoformat()
    demo_password_hash = hash_password("password123")
    
    # 1. Seed Organizer: Okiki Adewale
    cursor = await db.execute(
        "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?);",
        ("Okiki Adewale", "okiki@schoolfund.ng", demo_password_hash, now)
    )
    organizer_id = cursor.lastrowid

    # 2. Seed Demo Fund: CSC 301 Final Project
    fund_cursor = await db.execute(
        """
        INSERT INTO funds (public_code, owner_id, name, description, target_amount, contribution_amount, allow_custom_amount, currency, deadline, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            "SF-CSC301",
            organizer_id,
            "CSC 301 Final Project",
            "Funding for our final year computer science group project hardware, server deployment, and documentation printouts.",
            150000.0,
            5000.0,
            1,
            "NGN",
            "2026-09-30",
            "active",
            now
        )
    )
    fund_id = fund_cursor.lastrowid

    # 3. Seed 19 Paid Contributors (Total = 19 * 5,000 = ₦95,000)
    contributors = [
        ("David Okafor", "david.o@unilag.edu.ng"),
        ("Mary James", "mary.j@unilag.edu.ng"),
        ("John Ade", "john.ade@unilag.edu.ng"),
        ("Peter Obi", "peter.obi@unilag.edu.ng"),
        ("Chidinma Eze", "chidinma.eze@unilag.edu.ng"),
        ("Tunde Bakare", "tunde.b@unilag.edu.ng"),
        ("Fatima Dangote", "fatima.d@unilag.edu.ng"),
        ("Emeka Nwosu", "emeka.n@unilag.edu.ng"),
        ("Zainab Aliyu", "zainab.a@unilag.edu.ng"),
        ("Ifeanyi Kalu", "ifeanyi.k@unilag.edu.ng"),
        ("Boluwatife Adeleke", "bolu.adeleke@unilag.edu.ng"),
        ("Amina Mohammed", "amina.m@unilag.edu.ng"),
        ("Samuel Oladipo", "sam.oladipo@unilag.edu.ng"),
        ("Grace Bassey", "grace.b@unilag.edu.ng"),
        ("Kayode Fashola", "kayode.f@unilag.edu.ng"),
        ("Blessing Udoh", "blessing.u@unilag.edu.ng"),
        ("Victor Oshodi", "victor.o@unilag.edu.ng"),
        ("Khadija Bello", "khadija.b@unilag.edu.ng"),
        ("Femi Adeleke", "femi.a@unilag.edu.ng"),
    ]

    for idx, (name, email) in enumerate(contributors):
        ref_id = f"SF-CONT-20260904-DEMO{idx+1:02d}"
        await db.execute(
            """
            INSERT INTO contributions (fund_id, contributor_name, contributor_email, amount, currency, status, provider, reference_id, metadata, created_at, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                fund_id,
                name,
                email,
                5000.0,
                "NGN",
                "success",
                "BMONI_SANDBOX",
                ref_id,
                json.dumps({"seeded": True, "note": "Pre-populated demo contributor"}),
                now,
                now
            )
        )
        # Transaction record
        await db.execute(
            """
            INSERT INTO transactions (fund_id, reference_id, type, amount, currency, status, provider, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                fund_id,
                ref_id,
                "contribution",
                5000.0,
                "NGN",
                "success",
                "BMONI_SANDBOX",
                json.dumps({"contributor": name, "seeded": True}),
                now
            )
        )

    # 4. Seed Expenses (Total = 25,000 + 20,000 + 17,500 = ₦62,500)
    expenses = [
        ("Project Documentation Printing", "Spiral binding and high-res colored schematics", 25000.0, "Printing"),
        ("Microcontrollers & Sensors", "ESP32 units, jumper wires, and breadboards", 20000.0, "Materials"),
        ("Server & Domain Hosting", "Cloud deployment for demo presentation", 17500.0, "Equipment"),
    ]

    for title, desc, amount, category in expenses:
        exp_ref = f"SF-EXP-{title[:4].upper()}"
        await db.execute(
            """
            INSERT INTO expenses (fund_id, title, description, amount, category, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (fund_id, title, desc, amount, category, organizer_id, now)
        )
        await db.execute(
            """
            INSERT INTO transactions (fund_id, reference_id, type, amount, currency, status, provider, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                fund_id,
                f"SF-TX-EXP-{datetime.now().microsecond}",
                "expense",
                amount,
                "NGN",
                "success",
                "INTERNAL",
                json.dumps({"expense_title": title, "category": category}),
                now
            )
        )

    # 5. Audit Log Entry
    await db.execute(
        """
        INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?);
        """,
        (
            organizer_id,
            fund_id,
            "fund_created",
            json.dumps({"fund_name": "CSC 301 Final Project", "target": 150000.0}),
            now
        )
    )

    await db.commit()
