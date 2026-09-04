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

class ExpenseStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    REJECTED = "rejected"

class AuditAction(str, Enum):
    FUND_CREATED = "fund_created"
    FUND_UPDATED = "fund_updated"
    CONTRIBUTION_INITIATED = "contribution_initiated"
    CONTRIBUTION_SUCCESSFUL = "contribution_successful"
    CONTRIBUTION_FAILED = "contribution_failed"
    EXPENSE_ADDED = "expense_added"
    EXPENSE_REQUESTED = "expense_requested"
    EXPENSE_APPROVED = "expense_approved"
    EXPENSE_REJECTED = "expense_rejected"
    EXPENSE_SETTLED = "expense_settled"
    REPORT_GENERATED = "report_generated"

