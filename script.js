/* eslint-disable no-useless-escape */
/* eslint-disable no-console */

// JS CALCULATOR
// 2019 - Francesco Catania

// INTERFACE CODE

let displayString = '0';
let operatorPressed = false;
let dotPressed = false;
let allowDot = true;
const display = document.querySelector('.display');
const buttons = document.querySelectorAll('.calcButton');
const divideError = 'BOOM';
const invalidInputError = 'invalid input';



function updateDisplay(value) {
  if (value) {
    display.innerHTML = value;
  } else {
    display.innerHTML = 0;
    displayString = '0';
  }
}


function buttonAction(e) {
  const lastChar = displayString[displayString.length - 1];
  const buttonValue = e.target.dataset.value;
  const buttonType = e.target.dataset.type;

  if (displayString == divideError || displayString == invalidInputError) {
    displayString = 0;
  }

  if (operatorPressed) {
    dotPressed = false;
  }
  if (lastChar == '(' || !isNaN(Number(lastChar))) {
    allowDot = true;
  } else {
    allowDot = false;
  }


  if (buttonValue == 'clear') {
    dotPressed = false;
    displayString = '0';
  } else if (buttonValue == '.') {
    if (!dotPressed && allowDot) {
      displayString += buttonValue;
      dotPressed = true;
    } else {
      return
    }
  } else if (buttonValue == '=') {
    displayString = resolve(displayString);
    dotPressed = displayString.includes('.');
  } else if (buttonValue == 'delete') {
    if (lastChar == '.' || ((lastChar == ')' || lastChar == '('))) {
      dotPressed = !dotPressed;
    }
    displayString.length > 1 ? displayString = displayString.slice(0, -1) : displayString = '0';
  } else if (buttonType == 'operator' && operatorPressed == true) {
    displayString = displayString.slice(0, -1) + buttonValue;
  } else {

    if (displayString == '0') {
      buttonType == 'number' || buttonType == 'parenthesis' ? displayString = buttonValue : displayString = '0' + buttonValue;
    } else {
      displayString += buttonValue;
    }

  }

  buttonType == 'operator' ? operatorPressed = true : operatorPressed = false; // to avoid concatenation of operators
  if (buttonType == 'parenthesis') {
    dotPressed = false;
  }


  updateDisplay(displayString);
}




// LISTENERS

buttons.forEach(button => {
  button.addEventListener('click', buttonAction);
});

document.addEventListener('keydown', keyboardInput);

function keyboardInput(e) {
  const pressed = e.key;
  const targetValue = document.querySelector(`[data-value="${pressed}"]`);

  switch (pressed) {
    case 'Enter':
      document.querySelector('[data-value="="]').click();
      break;
    case 'Backspace':
      document.querySelector('[data-value="delete"]').click();
      break;
    case 'C':
      document.querySelector('[data-value="clear"]').click();
      break;
    default:
      if (targetValue) {
        targetValue.click()
      } else {
        return
      }

      break;
  }
}




// MATH CODE
const splitRegex = /(\d*\.?\d+)|[+\-*\/()]/g;
const operatorList = '()+-/*';


function operate(a, b, operator) {
  let currentValue = Number(a);
  let newValue = Number(b);
  let result;
  switch (operator) {
    case '+':
      result = currentValue + newValue;
      break

    case '-':
      result = currentValue - newValue;
      break

    case '*':
      result = currentValue * newValue;
      break

    case '/':
      (newValue == 0) ? result = divideError:
        result = (Math.round((currentValue / newValue) * 1000)) / 1000; // ERROR
      break
  }
  return result
}



function resolve(input) {
  let checkedInput = sanitizeInput(input);
  if (checkedInput == invalidInputError) {
    return invalidInputError
  } else {
    return postfixResolve(toPostfix(checkedInput)).toString()
  }
}

function postfixResolve(input) {
  let stack = [];
  let tokens = input.match(splitRegex).reverse();
  for (const token of tokens.reverse()) {
    if (operatorList.indexOf(token) == -1) {
      stack.push(token);
    } else {
      let b = stack.pop();
      let a = stack.pop();
      let result = operate(a, b, token)
      if (result == divideError) {
        return divideError
      } else {
        stack.push(result);
      }
    }
  }
  return stack.length == 1 && !isNaN(stack[0]) ? stack[0] : invalidInputError
}





function toPostfix(input) {
  const operatorPrecedence = {
    '(': 0,
    ')': 0,
    '+': 1,
    '-': 1,
    '/': 2,
    '*': 2
  };

  let outputQueue = [];
  let stack = [];
  let tokens = input.match(splitRegex);



  for (const token of tokens) {

    if (operatorList.indexOf(token) == -1) { //token is a number
      outputQueue.push(token);

    } else if (token == '(') {
      stack.push(token);

    } else if (token == ')') {
      let indexOfStack = stack.length - 1;
      while (indexOfStack >= 0) {
        if (stack[indexOfStack] == '(') {
          stack.pop();
          break
        }
        outputQueue.push(stack.pop());
        indexOfStack--;

      }

    } else { // token is an operator
      let indexOfStack = stack.length - 1;
      while ((indexOfStack >= 0) && (operatorPrecedence[stack[indexOfStack]] >= operatorPrecedence[token])) {
        outputQueue.push(stack.pop());
        indexOfStack--;

      }
      stack.push(token);
    }

  }

  while (stack.length > 0) {
    outputQueue.push(stack.pop())

  }


  return outputQueue.join(' ')

}



function sanitizeInput(input) {

  // check for parenthesis congruence
  function parenthesisCongruence(string) {
    let parenthesis = string.replace(/[^()]/g, '');
    let counter = 0;
    for (const char of parenthesis) {
      char == '(' ? counter++ : counter--;
      if (counter < 0) {
        return false
      }
    }
    return true
  }

  input = input.replace(/\s/g, ''); // removes whitespace

  function fixedInput(input) {
    const unaryMinusRegex = /([^\d)]|^)(-(\d+))/g; // fix unary minuses
    const unaryMinusSubst = `$1(0$2)`; // 
    const operatorAndMinusRegex = /(^|[+\-*\/])(-)/g; // fix couples of operator and minuses ERROR: (0-1) becames principal factor
    const operatorAndMinusSubst = `$1(0-1)*`; //
    const addMultiplyRegex = /(\d+|\))(\()/g; // add implicit '*' 
    const addMultiplySubst = `$1*$2`; //

    return input.replace(operatorAndMinusRegex, operatorAndMinusSubst)
      .replace(unaryMinusRegex, unaryMinusSubst)
      .replace(addMultiplyRegex, addMultiplySubst)
  }

  return parenthesisCongruence(input) ? fixedInput(input) : invalidInputError


}





/*  TEST CODE

function testMath(input) {
  let testPostfix = toPostfix(input);
  console.log('\nTest resolve: \n');
  console.log('%cinput: ' + input, 'color: blue;')
  console.log('topostfix: ' + testPostfix);
  console.log('%cresult: ' + postfixResolve(testPostfix), 'color: red;');

}



function testSanitize(input) {
  console.log('test sanitize:\n');
  console.log('%cinput string: ' + input, 'color: blue;');
  console.log('\n');
  console.log('%c'+sanitizeInput(input), 'color: green;');
  return sanitizeInput(input)
}


const testString = '  -(1 -2)-  3 '; // 
const testString2 = '-3+4*(-6*7)+(6/-2)';
const testString3 = '2*6-(6-3)'


function testObject(input) {
  this['input'] = input,
    this['sanitized input'] = sanitizeInput(this.input),
    this['postfix expression'] = toPostfix(this['sanitized input']),
    this['result'] = postfixResolve(this['postfix expression'])
}

let test1 = new testObject(testString);
console.table(test1);

let test2 = new testObject(testString2);
console.table(test2);

let test3 = new testObject(testString3);
console.table(test3);

*/