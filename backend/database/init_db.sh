#!/bin/bash

# cancella il database se esiste
rm -f database.sqlite

# crea il nuovo database ed esegue lo schema
sqlite3 database.sqlite < database.sql

echo "Database creato da zero!"