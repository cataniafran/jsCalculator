# jsCalculator
A browser calculator
https://cataniafran.github.io/jsCalculator/


An interesting exercise made during the Odin Project course (https://www.theodinproject.com/).
The code is a bit messy, since i've splitted input validation between input-handling code and the expression parser, but it works.
The most interesting part was understanding and implementing the Shunting Yard algorithm (http://www.oxfordmathcenter.com/drupal7/node/628).

TODO:

Clean code: I think i can handle edge cases (unary minuses, implicit multiplication etc.) inside the toPostfix and PostfixResolve functions.

CSS love: The calculator is very ugly and it needs a better solution for long expresions and keyboard input animations.

