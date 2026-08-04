# CodeQL digest

total results: 186
rules with hits: 7

## js/use-before-declaration  [None]  x96

files: {'src/RosCard.js': 96}
  - src/RosCard.js:122  Variable 'n' is used before its [declaration](1).
  - src/RosCard.js:122  Variable 'o' is used before its [declaration](1).
  - src/RosCard.js:262  Variable 'o' is used before its [declaration](1).
  - src/RosCard.js:559  Variable 'n' is used before its [declaration](1).
  - src/RosCard.js:559  Variable 'r' is used before its [declaration](1).
  - src/RosCard.js:636  Variable 'a' is used before its [declaration](1).
  ... and 90 more

## js/trivial-conditional  [None]  x44

files: {'src/RosCard.js': 44}
  - src/RosCard.js:122  This logical 'and' expression can be replaced with a comma expression.
  - src/RosCard.js:672  This use of variable 'r' always evaluates to true.
  - src/RosCard.js:672  This use of variable 'a' always evaluates to true.
  - src/RosCard.js:1832  This use of variable 'r' always evaluates to true.
  - src/RosCard.js:2209  This use of variable 'r' always evaluates to true.
  - src/RosCard.js:2209  This use of variable 'o' always evaluates to true.
  ... and 38 more

## js/unreachable-statement  [None]  x24

files: {'src/RosCard.js': 24}
  - src/RosCard.js:221  This statement is unreachable.
  - src/RosCard.js:675  This statement is unreachable.
  - src/RosCard.js:1835  This statement is unreachable.
  - src/RosCard.js:2212  This statement is unreachable.
  - src/RosCard.js:2831  This statement is unreachable.
  - src/RosCard.js:2935  This statement is unreachable.
  ... and 18 more

## js/automatic-semicolon-insertion  [None]  x10

files: {'src/RosCard.js': 10}
  - src/RosCard.js:215  Avoid automated semicolon insertion (92% of all statements in [the enclosing function](1) have an explicit semicolon).
  - src/RosCard.js:807  Avoid automated semicolon insertion (96% of all statements in [the enclosing function](1) have an explicit semicolon).
  - src/RosCard.js:1294  Avoid automated semicolon insertion (96% of all statements in [the enclosing function](1) have an explicit semicolon).
  - src/RosCard.js:1480  Avoid automated semicolon insertion (95% of all statements in [the enclosing function](1) have an explicit semicolon).
  - src/RosCard.js:1700  Avoid automated semicolon insertion (92% of all statements in [the enclosing function](1) have an explicit semicolon).
  - src/RosCard.js:1783  Avoid automated semicolon insertion (90% of all statements in [the enclosing function](1) have an explicit semicolon).
  ... and 4 more

## js/comparison-between-incompatible-types  [None]  x9

files: {'src/RosCard.js': 9}
  - src/RosCard.js:2901  This expression is of type null, but it is compared to [variable 't'](1) of type undefined.
  - src/RosCard.js:3351  This expression is of type null, but it is compared to [variable 't'](1) of type undefined.
  - src/RosCard.js:3994  This expression is of type null, but it is compared to [variable 't'](1) of type undefined.
  - src/RosCard.js:4713  This expression is of type null, but it is compared to [variable 't'](1) of type undefined.
  - src/RosCard.js:5207  This expression is of type null, but it is compared to [variable 't'](1) of type undefined.
  - src/RosCard.js:5645  This expression is of type null, but it is compared to [variable 't'](1) of type undefined.
  ... and 3 more

## js/xss-through-dom  [None]  x2

files: {'src/RosCard.js': 2}
  - src/RosCard.js:774  [DOM text](1) is reinterpreted as HTML without escaping meta-characters.
  - src/RosCard.js:4186  [DOM text](1) is reinterpreted as HTML without escaping meta-characters.

## js/useless-comparison-test  [None]  x1

files: {'src/RosCard.js': 1}
  - src/RosCard.js:7897  The condition '0 === t' is always false.
