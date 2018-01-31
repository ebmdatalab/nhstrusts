AllTrials
=========

A project to visualise the openness of clinical trials data from the major
pharmaceutical companies.

The data is generated from a Google Spreadsheet (currently [here](https://docs.google.com/spreadsheets/d/1EMUUwsPLW2Ls377m3EbGIQtlCe1jFT2sK9yn5C7drqM/edit#gid=1670470452)).

To install, make a file at `./conf/general.yml` using the example in that folder, then run:

    ./script/post-deploy

Then set up a web server with its document root pointing to `./_site/`.

# Notes

This depends on two worksheets in one Google Sheet.

The two worksheets are joined by the "org code" column which must be consistent between them.

# Sources

* NHS Trusts: https://nhsenglandfilestore.s3.amazonaws.com/ods/etr.csv. This file propercased, headers added, turned into `trusts.csv`
*
