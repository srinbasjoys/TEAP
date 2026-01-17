#!/bin/bash
cd /app/frontend
exec serve -l 3000 --no-clipboard --config serve.json build
