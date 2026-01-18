.PHONY: setup start

setup:
	python3 -m venv .venv
	. .venv/bin/activate && pip install -r requirements.txt

start:
	. .venv/bin/activate && python server.py
