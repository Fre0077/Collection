#!/bin/bash

DB_FILE="database.sqlite"

# inserisce i dati di test
sqlite3 $DB_FILE < ./manage/delete.sql

echo "collezione rimossa con successo!"