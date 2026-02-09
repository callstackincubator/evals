Implement a write pipeline that uses SQLite exclusive transactions to guarantee deterministic ordering when concurrent writes are attempted, and rollback cleanly on failure to avoid partial writes.
