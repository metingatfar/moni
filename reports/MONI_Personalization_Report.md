# MONI 3.0 Local Memory Personalization Architecture

## 1. Dynamic User Name Retrieval
To make MONI multi-user ready, name resolution scans:
1. SQLite memory profile category equals 'name'.
2. Memory items where key equals 'userName'.
3. Facts containing "Benim adım X" or "My name is X".
4. LocalStorage overrides.
5. Default profile names.

## 2. Privacy & Compliance
All user greeting details and local facts remain stored within the SQLite offline databases.
