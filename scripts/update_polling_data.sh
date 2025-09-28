#!/bin/bash

# Polling Data Update Script for Inklined
# This script updates polling data daily via legal web scraping

# Set the project directory
PROJECT_DIR="/Users/sawyernordberg/Downloads/inklined 1.2/nextjs-political-dashboard"

# Change to project directory
cd "$PROJECT_DIR"

# Run the polling scraper
echo "Updating polling data..."
python3 -m scripts.polling_scraper

# Check if the update was successful
if [ $? -eq 0 ]; then
    echo "Polling data updated successfully!"
    echo "Data saved to: public/data/legal_polling_data.json"
else
    echo "Error updating polling data"
    exit 1
fi

# Optional: Commit to git if you're using version control
# git add public/data/legal_polling_data.json
# git commit -m "Update polling data - $(date)"
# git push

echo "Polling data update completed at $(date)"
