let display = document.getElementById("input");

const OPERATORS = ['+', '-', 'X', '÷'];

// Safe expression parser and evaluator
class Calculator {
  constructor(expr) {
    this.expr = expr.replace(/X/g, '*').replace(/÷/g, '/');
    this.pos = 0;
  }

  parse() {
    return this.parseExpression();
  }

  parseExpression() {
    let result = this.parseTerm();
    while (this.pos < this.expr.length && (this.expr[this.pos] === '+' || this.expr[this.pos] === '-')) {
      const op = this.expr[this.pos++];
      const right = this.parseTerm();
      result = op === '+' ? result + right : result - right;
    }
    return result;
  }

  parseTerm() {
    let result = this.parseFactor();
    while (this.pos < this.expr.length && (this.expr[this.pos] === '*' || this.expr[this.pos] === '/')) {
      const op = this.expr[this.pos++];
      const right = this.parseFactor();
      if (op === '*') {
        result = result * right;
      } else {
        if (right === 0) throw new Error("Division by zero");
        result = result / right;
      }
    }
    return result;
  }

  parseFactor() {
    // Handle negative numbers
    if (this.expr[this.pos] === '-') {
      this.pos++;
      return -this.parseFactor();
    }
    return this.parseNumber();
  }

  parseNumber() {
    let num = '';
    while (this.pos < this.expr.length && (this.isDigit(this.expr[this.pos]) || this.expr[this.pos] === '.')) {
      num += this.expr[this.pos++];
    }
    if (num === '' || num === '.') throw new Error("Invalid number");
    return parseFloat(num);
  }

  isDigit(char) {
    return char >= '0' && char <= '9';
  }
}

const appendValue = (value) => {
  // Auto-clear if showing error or invalid
  if (display.value === "Error" || display.value === "Invalid") {
    display.value = "";
  }
  
  const lastChar = display.value.slice(-1);
  
  // Prevent multiple operators in a row
  if (OPERATORS.includes(value) && OPERATORS.includes(lastChar)) {
    display.value = display.value.slice(0, -1) + value;
    return;
  }

  // Prevent leading operator (except minus for negative numbers)
  if (OPERATORS.includes(value) && display.value === '') {
    if (value !== '-') return;
  }

  // Prevent multiple decimal points in same number
  if (value === '.') {
    const lastNumber = display.value.split(/[+\-X÷]/).pop();
    if (lastNumber.includes('.')) return;
  }

  display.value += value;
};

const clearDisplay = () => {
  display.value = "";
};

const deleteLast = () => {
  // Auto-clear if showing error or invalid
  if (display.value === "Error" || display.value === "Invalid") {
    display.value = "";
    return;
  }
  display.value = display.value.slice(0, -1);
};

const calculate = () => {
  if (display.value === '') return;

  try {
    const input = display.value.trim();
    
    // Handle percentage cases
    let expression = input;
    
    // a+b% -> a+(a*b/100)
    expression = expression.replace(
      /(\d+\.?\d*)([+\-])(\d+\.?\d*)%/g,
      (m, a, op, b) => `${a}${op}(${a}*${b}/100)`
    );
    
    // Standalone % at end -> divide by 100
    expression = expression.replace(/%$/g, '/100');
    
    // Replace X with * and ÷ with /
    expression = expression.replace(/X/g, '*').replace(/÷/g, '/');

    // Calculator class will handle validation and errors
    const calculator = new Calculator(expression);
    const result = calculator.parse();

    // Format result: remove trailing zeros
    const formatted = parseFloat(result.toFixed(8)).toString();
    display.value = formatted;
  } catch (error) {
    display.value = "Error";
  }
};

// Keyboard support
document.addEventListener("keydown", (e) => {
  const key = e.key;
  let handled = true;

  if ((key >= "0" && key <= "9") || key === "." || key === "+" || key === "-") {
    appendValue(key);
  } else if (key === "*" || key === "x" || key === "X") {
    appendValue("X");
  } else if (key === "%") {
    appendValue("%");
  } else if (key === "/") {
    appendValue("÷");
  } else if (key === "Enter" || key === "=") {
    calculate();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape") {
    clearDisplay();
  } else {
    handled = false;
  }

  if (handled) e.preventDefault();
});