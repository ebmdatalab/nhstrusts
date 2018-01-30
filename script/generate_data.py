"""
Script to generate two CSVs required by the Jekyll app.

Works off the Google Sheet referenced at `SOURCE`.

Places the results in `_data/`.

To run:

    $ python script/generate_data.py
"""

from ranking import Ranking
import csv
import re
from titlecase import titlecase

import requests


# original: 1XYZZsRq50WsVjJfuCWNbEughXQqyiFJeW7tXGgdBv5I
RAW_SOURCE = ('https://docs.google.com/spreadsheets/d/e/2PACX-1vS'
              'B8VAyCgaiIxG04m7WkLUQMykHm67an6J3GlYQ6JrAAyEv4N_r1L'
              'PaSpg3vqNgFWk5rjDth85bsUxH/pub?gid=0&single=true&output=csv')
SCORES_SOURCE = ('https://docs.google.com/spreadsheets/d/e/'
                 '2PACX-1vSB8VAyCgaiIxG04m7WkLUQMykHm67an6J'
                 '3GlYQ6JrAAyEv4N_r1LPaSpg3vqNgFWk5rjDth85bsUxH/pub'
                 '?gid=1987633112&single=true&output=csv')


def nhs_abbreviations(word, **kwargs):
    if len(word) == 2 and word.lower() not in [
            'at', 'of', 'in', 'on', 'to', 'is', 'me', 'by', 'dr', 'st']:
        return word.upper()
    elif word.lower() in ['dr', 'st', 'st.']:
        return word.title()
    elif word.upper() in ('NHS', 'CCG', 'PMS', 'SMA', 'PWSI', 'OOH', 'HIV'):
        return word.upper()
    elif '&' in word:
        return word.upper()
    elif ((word.lower() not in ['ptnrs', 'by', 'ccgs']) and
          (not re.match(r'.*[aeiou]{1}', word.lower()))):
        return word.upper()


def nhs_titlecase(words):
    if words:
        title_cased = titlecase(words, callback=nhs_abbreviations)
        words = re.sub(r'Dr ([a-z]{2})', 'Dr \1', title_cased)
    return words


def convert_trusts_csv():
    from io import BytesIO
    import zipfile
    urls = [
        ('https://digital.nhs.uk/media/352/etr/zip/etr', 'etr.csv'),
        ('https://digital.nhs.uk/media/349/ect/zip/ect', 'ect.csv')]
    with open('./_data/trusts.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(
            ['org_code', 'name', 'addr1', 'addr2', 'addr3',
             'city', 'county', 'postcode']
        )
        for url, filename in urls:
            response = requests.get(url)
            csvzip = zipfile.ZipFile(
                BytesIO(response.content)
            )
            csvfile = csvzip.open(filename, 'r')
            reader = csv.reader([x.decode('utf8') for x in csvfile.readlines()], delimiter=',')
            for row in reader:
                writer.writerow(
                    [
                        row[0],
                        nhs_titlecase(row[1]),
                        nhs_titlecase(row[4]),
                        nhs_titlecase(row[5]),
                        nhs_titlecase(row[6]),
                        nhs_titlecase(row[7]),
                        nhs_titlecase(row[8]),
                        row[9]
                    ])

def main():
    """Download raw data, convert it into two spreadsheets for consumption
    by the Jekyll app

    """
    convert_trusts_csv()
    # Get the raw answers
    download = requests.get(RAW_SOURCE)
    content = download.content
    reader = csv.reader([x.decode('utf8') for x in content.splitlines()], delimiter=',')
    fieldnames = [x.lower().replace(' ', '_').replace('?', '')
                  for x in next(reader)]
    with open('./_data/hospitality-coi-raw.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(fieldnames)
        for row in reader:
            writer.writerow(row)
    # Get the scores
    download = requests.get(SCORES_SOURCE)
    content = download.content
    reader = csv.reader([x.decode('utf8') for x in content.splitlines()], delimiter=',')
    fieldnames = [x.lower().replace(' ', '_').replace('?', '')
                  for x in next(reader)]
    scores_with_entity = sorted(list(reader), key=lambda x: (-int(x[7]), x[1]))
    scores_only = [x[7] for x in scores_with_entity]
    with open('./_data/hospitality-coi-scores.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['rank'] + fieldnames)
        for i, (rank, row) in enumerate(Ranking(scores_only, start=1)):
            writer.writerow([rank] + scores_with_entity[i])
    # Maintain these questions manually
    #with open('./_data/hospitality-coi-scores-questions.csv', 'wb') as csvfile:
    #    writer = csv.writer(csvfile)
    #    writer.writerow(fieldnames)

if __name__ == '__main__':
    main()
