# Customer wallet statement

## Purpose

Give customers a readable, traceable record of every movement recorded against their delivery wallet. The statement uses the wallet ledger as its source and describes only reasons that can be established from stored data.

## Research behind the design

- A useful account history identifies the date, amount, transaction type, and a reference that lets someone investigate an entry. The [CFPB prepaid account guide](https://files.consumerfinance.gov/f/documents/20170131_cfpb_Prepaid_guide_V1.pdf) is a design reference for these fields, not a claim about local legal requirements.
- [Apple's list guidance](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) supports a scannable summary list that opens a fuller detail view.
- [Apple's writing guidance](https://developer.apple.com/design/human-interface-guidelines/writing) favors plain, specific labels such as “Added money to wallet” over “Transaction.”
- [Stripe balance transactions](https://docs.stripe.com/api/balance_transactions/object) distinguish amount, type, description, time, and reference. The customer wallet is a separate ledger, so its statement must describe wallet credits and debits rather than imply a Stripe balance transaction is the wallet entry itself.

## Delivered behavior

The statement shows current wallet balance, month-grouped activity, signed colón amounts, credit/debit filters, and paginated history. Each entry opens a detail view with its recorded time, status, reason, wallet transaction ID, and payment or order reference when known. New wallet-funded orders record their order ID against the debit, allowing navigation to that order. The server returns a stable `direction`, `reasonCode`, `referenceId`, and optional `orderId` while preserving its older response fields. The customer statement requests `statement=true`, which includes only rows tied to that customer wallet.

## Data integrity and remaining work

- Historical debits without an order marker remain “Wallet debit.” Their original order cannot be recovered reliably from amount and time alone.
- The current schema does not store a per-entry closing balance. The screen shows **current balance** and does not invent running balances. If a bank-style reconciled statement or export is required, add immutable `balance_after`, source type/source ID, and a monotonically ordered ledger sequence to each new wallet entry, then reconcile historic entries before showing past balances.
- Withdrawal requests currently identify a user but not a customer wallet. The statement excludes them until they have a wallet ID and a corresponding wallet ledger debit. Existing legacy history behavior remains available without `statement=true`.
- For future audit support, consider statement date range and export after ledger attribution and running balances are reliable. An export should include currency, time zone, opening and closing balances, signed movements, reason, status, and both wallet and external references.

## Manual review scenarios

Check a card top-up of at least ₡500, a wallet-funded order, a refund, a loyalty conversion, the credit/debit filters, pagination beyond 25 rows, empty and error states, and the order link. Compare transaction IDs and amounts with server records. Review an older unmarked debit to confirm it remains generic. Automated validation was intentionally not run per project instructions.
