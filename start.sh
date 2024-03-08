#!/bin/bash

echo "Installing dependencies and starting the backend..."
cd node
npm install
npm run dev &

echo "Installing dependencies and starting the UI..."
cd ../ui
npm install
npm run build
npm run preview
