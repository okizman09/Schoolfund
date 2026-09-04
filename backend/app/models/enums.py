from enum import Enum

class FundStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ContributionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TransactionType(str, Enum):
    CONTRIBUTION = "contribution"
    EXPENSE = "expense"
    REFUND = "refund"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ExpenseCategory(str, Enum):
    EQUIPMENT = "Equipment"
    MATERIALS = "Materials"
    PRINTING = "Printing"
    TRANSPORT = "Transport"
    VENUE = "Venue"
    OTHER = "Other"

class AuditAction(str, Enum):
    FUND_CREATED = "fund_created"
    FUND_UPDATED = "fund_updated"
    CONTRIBUTION_INITIATED = "contribution_initiated"
    CONTRIBUTION_SUCCESSFUL = "contribution_successful"
    CONTRIBUTION_FAILED = "contribution_failed"
    EXPENSE_ADDED = "expense_added"
    REPORT_GENERATED = "report_generated"
