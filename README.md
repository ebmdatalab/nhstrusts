NHS COI
=======

Presenting structured and raw data we received in response to
requesting Conflict of Interest registers from evey Trust in England.

To install, make a file at `./conf/general.yml` using the example in that folder, then run:

    ./deploy/post-deploy

Then set up a web server with its document root pointing to `./_site/`
(see the contents of the `deploy/` directory for example nginx config)

These steps are carried out for you if you run

    fab deploy:production

or

    fab deploy:staging


# Implementation notes

The script `generate_data.py` does the following:

* [NHS Trusts](https://nhsenglandfilestore.s3.amazonaws.com/ods/etr.csv). This file propercased, headers added, turned into `trusts.csv`
* [Google Sheet](https://docs.google.com/spreadsheets/d/1XYZZsRq50WsVjJfuCWNbEughXQqyiFJeW7tXGgdBv5I/) originally created by Harriet. It contains 3 worksheets; we're interested in two:
  * The "Responses" worksheet contains questions and answers for individual Trusts (e.g. did they respond on time, etc). We convert this to a CSV `hospitality-coi-raw.csv`. The data from this CSV is displayed on the page for an individual trust. It also contains a column with a reference to a DOI from Figshare, with which we can refer to the document(s) returned by Trusts in response to the FOI requests.
  * The "Transparency Score" worksheet is a hand-normalised version of a subset of the same data, with a Total Score column.  We add a ranking column, and convert this to `hospitality-coi-scores.csv`. This data is displayed on the home page.
* `hospitality-coi-questions.csv` - manually curated, single-row spreadsheet with friendly names for the titles at the top of the first worksheet of the Google Sheet

The two trust worksheets are joined by the "org code" column which must be consistent between them and the `trusts.csv` file.  The questions worksheet is joined by the respective column headings.

Jekyll generates static pages by running the plugin code at
`_plugins/trusts.rb`, which iterates over the contents of the three
CSVs described above.
