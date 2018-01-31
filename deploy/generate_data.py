"""
Script to generate two CSVs required by the Jekyll app.

Works off the Google Sheet referenced at `RAW_SOURCE` and `SCORES_SOURCE`.

Places the results in `_data/`.

To run:

    $ python deploy/generate_data.py
"""

from ranking import Ranking
import csv
import re
from titlecase import titlecase

import requests


# The "Responses" worksheet with trust metadata and DOI referencesen
RAW_SOURCE = ('https://docs.google.com/spreadsheets/d/e/'
              '2PACX-1vSNGBQGHtzVN0j5QDQgYhnRzxSOdkj2Pe_'
              'QXNp7KJOHXMM61iJ5-pjZbDEJle1T3CBvtq7CnECV'
              'jO0N/pub?gid=0&single=true&output=csv')
# The "Transparency Score" worksheet
# Apparently wrong....
SCORES_SOURCE = (
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNGB'
    'QGHtzVN0j5QDQgYhnRzxSOdkj2Pe_QXNp7KJOHXMM61iJ5-pjZbDE'
    'Jle1T3CBvtq7CnECVjO0N/pub?gid=1987633112&single=true&output=csv')

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
        prev_rank = None
        current_rank = 1
        enumerated_ranking = list(enumerate(Ranking(scores_only, start=1)))
        for i, (rank, row) in enumerated_ranking:
            current_rank = rank
            if (i + 1) < len(enumerated_ranking):
                next_rank = enumerated_ranking[i + 1][0]
            else:
                next_rank = None
            if prev_rank == current_rank or next_rank == current_rank:
                rank = "={}".format(rank)
            writer.writerow([rank] + scores_with_entity[i])
            prev_rank = current_rank

    # Maintain these questions manually
    #with open('./_data/hospitality-coi-scores-questions.csv', 'wb') as csvfile:
    #    writer = csv.writer(csvfile)
    #    writer.writerow(fieldnames)

if __name__ == '__main__':
    main()
