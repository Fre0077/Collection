#!/bin/bash

DB_FILE="database.db"

# inserisce i dati di test
sqlite3 $DB_FILE < test_insert.sql

echo "Database popolato!"