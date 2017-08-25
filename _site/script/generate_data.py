"""
Script to generate two CSVs required by the Jekyll app.

Works off the Google Sheet referenced at `SOURCE`.

Places the results in `_data/`.

To run:

    $ python script/generate_data.py
"""

from collections import OrderedDict
import itertools
from functools import total_ordering
import csv
import re

import requests

SOURCE = ('https://docs.google.com/spreadsheets/d/'
          '1XYZZsRq50WsVjJfuCWNbEughXQqyiFJeW7tXGgdBv5I/export?format=csv')


def main():
    """Download raw data, convert it into two spreadsheets for consumption
    by the Jekyll app

    """
    download = requests.get(SOURCE)
    content = download.content
    reader = csv.reader(content.splitlines(), delimiter=',')
    reader.next()  # skip header
    with open('./_data/trusts.csv', 'wb') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['id', 'name'])
        for row in reader:
            writer.writerow([row[0], row[1]])
    reader = csv.reader(content.splitlines(), delimiter=',')
    fieldnames = [x.lower().replace(' ', '_').replace('?', '') for x in reader.next()]
    with open('./_data/hospitality-coi.csv', 'wb') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(fieldnames)
        for row in reader:
            writer.writerow(row)
    # Maintain these questions manually
    #with open('./_data/hospitality-coi-questions.csv', 'wb') as csvfile:
    #    writer = csv.writer(csvfile)
    #    writer.writerow(fieldnames)
if __name__ == '__main__':
    main()
