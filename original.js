//
// SCORE CALCULATION
//

var INPUT_WORKSHEET_NAME = "CONVERTED DATA FOR BEN";

function computeScore() {
  var total_cols = 52;
  var data_range_start = 2;
  var data_range_end = 47;
  var sheet = SpreadsheetApp.getActiveSheet();
  var current_col = currentColLetter()
  var range_label = INPUT_WORKSHEET_NAME + '!' + current_col + data_range_start + ':' + current_col + data_range_end;
  var values_range = sheet.getRange(range_label).getValues();
  var results = []; // We insert a row of data at the beginning to allow for a cell at the top with the score
  var total = 0;
  for (var j = 2; j < values_range.length + 1; j++) { // rows
    if (j in functions_by_row) {
     var data = functions_by_row[j].call();
     results.push([data]);
      Logger.log(j + ": " + data)
     total += data;
    } else {
      results.push(null);
    }
  }
  // The only way we can write to the non-selected cell in Google Sheets is by returning an
  // array-of-arrays which overflows the selected cell.
  results.unshift([total]);
  return results;
}

// row_2 actually corresponds with row 3 in the spreadsheet (etc)
var functions_by_row = {
  6: row_6,
  7: row_7,
  9: row_9,
  10: row_10,
  13: row_13,
  14: row_14,
  15: row_15,
  23: row_23,
  25: row_25,
  36: row_36,
  38: row_38,
  39: row_39,
  40: row_40,
  41: row_41,
  42: row_42
}


/*
# Registration
*/

// Prospectively (max 250 points)

function row_6() {
  // Discounts (apply to overall score above)
  // Include phase 4 trials?
  var scores = [];
  if (rowFlaggedTrue(2)) {
    // Do you have a policy to register all new trials?  (200 points)
    scores.push(200);
  }
  if (rowFlaggedTrue(3)) {
    // Do you audit compliance? Yes (20 points)? (1a)
    scores.push(20);
  }
  if (rowFlaggedTrue(4)) {
    //  Do you share summary results (20 points)? (1b)
    scores.push(20);
  }
  if (rowFlaggedTrue(5)) {
    // Do you share line-by-line results (10 points)?  (1c)
    scores.push(10);
  }
  if (scores.length > 0) {
    var total = scores.reduce(function (a, b) {
      return a + b;
    }, 0);
    if (!rowFlaggedTrue(6)) {
      total = total - 0.25 * total;
    }
  } else {
    total = 0;
  }
  return total
}

// Retrospectively (max 250 points)

function row_7() {
  // Does your current policy cover previous trials (ie from start date of current policy,
  // or by specifying a date that it goes back to)? (score from 1a)
  if (rowFlaggedTrue(7)) {
    var score  = row_6();
    score = score / 25 * rowYearsSince(8);
    return score
  } else {
    return 0;
  }
}

/*
 # Summary Results (max 500 points total).
*/

// Prospectively (max 250 points)

function row_9() {
  // Do they have a policy to share results at all? (Yes = 150 points)
  if (rowFlaggedTrue(9)) {
    return 150;
  } else {
    return 0;
  }
}

function row_10() {
  // Do they make a timeline commitment, ie within 12 months of completion (max 100 points)
  // (The highest possible of three options in rows 10, 11, and 12)
  var scores = [];
  if (rowFlaggedTrue(10)) {
    // Post summary results on all pre-specified primary and secondary outcomes of all trials to clinicaltrials.gov?
    scores.push(100);
  }
  if (rowFlaggedTrue(12)) {
    // OR Submit all trials to journal?
    scores.push(75);
  }
  if (rowFlaggedTrue(11)) {
    // OR Post summary results on all trials only to their own website?
    scores.push(50);
  }
  if (scores.length > 0) {
    return Math.max.apply(null, scores);
  } else {
    return 0;
  }
}

// Discounts

function row_13() {
  // Include unlicensed treatments?
  if (!rowFlaggedTrue(13)) {
    var total = row_9() + row_10();
    total = 0 - 0.25 * total
    return total;
  } else {
    return 0;
  }
}

function row_14() {
  // Include off-label uses?
  if (!rowFlaggedTrue(14)) {
    var total = row_9() + row_10();
    total = 0 - 0.25 * total
    return total;
  } else {
    return 0;
  }
}

function row_15() {
  // Include phase 4 trials?
  if (!rowFlaggedTrue(15)) {
    var total = row_9() + row_10();
    total = 0 - 0.25 * total
    return total;
  } else {
    return 0;
  }
}

// Retrospectively (max 250 points).

function row_23() {
  var score = 0;
  if (rowFlaggedTrue(16)) {
    // Do they have a policy to share past results at all?
    score = 250;
    discount = 0;
    if (!rowFlaggedTrue(20)) {
     // Include unlicensed treatments?
     discount += 0.25 * score;
    }
    if (!rowFlaggedTrue(21)) {
      // Include off-label uses?
     discount += 0.25 * score;
    }
    if (!rowFlaggedTrue(22)) {
     // Include phase 4 trials?
     discount += 0.25 * score;
    }
    score -= discount;
    // Discount for number of years back
    score = score / 25 * rowYearsSince(23);
  }
  return score;
}


/*
 # Clinical Study Reports (max 500 points total).
*/

// Prospectively (max 250 points)

function row_25() {
  // We want the lowest of these three possible scores
  var score;
  if (rowFlaggedTrue(30)) {
    // Do they share only synopses of Clinical Study Reports?
    score = 50;
  } else  if (rowFlaggedTrue(26)) {
    // Is this commitment on request only, after a long review process, similar to that for IPD?
    score = 200;
  } else if (rowFlaggedTrue(25)) {
    // Do they commit to share all Clinical Study Reports publicly?
    score = 250;
  } else {
    score = 0;
  }
  // Discounts
  discount = 0;
  if (!rowFlaggedTrue(28)) {
    // Include unlicensed treatments
    discount += 0.25 * score;
  }
  if (!rowFlaggedTrue(29)) {
    // Include off-label uses
    discount += 0.25 * score;
  }
  score -= discount;
  return score;
}

// Retrospectively (max 250 points)

function row_36() {
  var score = 0;
  if (rowFlaggedTrue(31)) {
    // Do they commit to share all Clinical Study Reports publicly?
    if (rowFlaggedTrue(35)) {
      // Do they share only synopses of Clinical Study Reports?
      score = 50;
    } else if (rowFlaggedTrue(32)) {
      // Is this commitment on request only, after a long review process, similar to that for IPD?
      score = 200;
    } else {
      // Do they commit to share all Clinical Study Reports publicly?
      score = 250;
    }
    // Discounts
    discount = 0;
    if (!rowFlaggedTrue(33)) {
      // Include unlicensed treatments
      discount += 0.25 * score;
    }
    if (!rowFlaggedTrue(34)) {
      // Include off-label uses
      discount += 0.25 * score;
    }
    score -= discount;
    // Divide retrospective score by 25, then multiply for every year
    // to which the retrospective policy applies.
    score = score / 25 * rowYearsSince(36);
  }
  return score
}

/*
 # Individual Patient Data (max 500 points total)
*/

// Prospectively (max 250 points)

function row_38() {
  if (rowFlaggedTrue(38)) {
    return 250;
  } else {
    return 0;
  }
}

// Discounts

function row_40() {
  // Include unlicensed treatments
  if (!rowFlaggedTrue(40)) {
    var total = 0 - row_38() * 0.25;
    return total;
  } else {
    return 0;
  }
}

function row_41() {
  // Include off-label uses
  if (!rowFlaggedTrue(41)) {
    var total = 0 - row_38() * 0.25;
    return total;
  } else {
    return 0;
  }
}

function row_42() {
  // Include discountphase 4 trials
  if (!rowFlaggedTrue(42)) {
    var total = 0 - row_38() * 0.25;
    return total;
  } else {
    return 0;
  }
}

// Retrospectively (max 250 points)

function row_39() {
  var score = 0;
  if (rowYearsSince(39) > 0) {
    // Do they have a policy to make IPD available on request [if they have any start date in 39]
    score = 250;
    var discount = 0;
    if (!rowFlaggedTrue(40)) {
      // Include unlicensed treatments
      discount += 0.25;
    }
    if (!rowFlaggedTrue(41)) {
      // Include off-label uses
      discount += 0.25;
    }
    if (!rowFlaggedTrue(42)) {
      // Include discountphase 4 trials
      discount += 0.25;
    }
    score = score - (score * discount);
    // Divide retrospective score by 25, then multiply for every year
    // to which the retrospective policy applies.
    score = score / 25 * rowYearsSince(39);
  }
  return score
}


function rowFlaggedTrue(row_num) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var raw_value = sheet.getRange(INPUT_WORKSHEET_NAME + '!' + currentColLetter() + row_num).getValue();
  return !!raw_value.match(/(\b|^)yes(\b|$)/i)
}

function rowYearsSince(row_num) {
  var sheet = SpreadsheetApp.getActiveSheet();
  return yearsSinceFromText(sheet.getRange(INPUT_WORKSHEET_NAME + '!' + currentColLetter() + row_num).getValue());
}


function currentColLetter() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = SpreadsheetApp.getActiveRange();
  var col = range.getColumn(),
      row = range.getRow(),
      col_letter = columnToLetter(col);
  return col_letter;
}


function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}


function yearsSinceFromText(input) {
  var this_year = 2016;
  var input = String(input);
  var found = input.match(/.*(\b|^){1}(\d{4})(\b|$){1}.*/);
  if (found) {
    return this_year - Math.max(parseInt(found[2]), 1991);
  } else {
    return 0;
  }
}
