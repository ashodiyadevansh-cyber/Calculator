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
  const cursorPos = display.selectionStart;
  const currentValue = display.value;
  
  // Auto-clear if showing error or invalid
  if (currentValue === "Error" || currentValue === "Invalid") {
    display.value = value;
    setTimeout(() => {
      display.focus();
      display.setSelectionRange(value.length, value.length);
      display.scrollLeft = display.scrollWidth;
    }, 0);
    return;
  }
  
  // Insert at cursor position
  const newValue = currentValue.slice(0, cursorPos) + value + currentValue.slice(cursorPos);
  display.value = newValue;
  
  // Move cursor after inserted text
  setTimeout(() => {
    const newPos = cursorPos + value.length;
    display.setSelectionRange(newPos, newPos);
    display.focus();
    display.scrollLeft = display.scrollWidth;
  }, 0);
};

const clearDisplay = () => {
  display.value = "";
  display.focus();
  display.setSelectionRange(0, 0);
};

const deleteLast = () => {
  const cursorPos = display.selectionStart;
  const currentValue = display.value;
  
  // Auto-clear if showing error or invalid
  if (currentValue === "Error" || currentValue === "Invalid") {
    display.value = "";
    return;
  }
  
  // Delete character before cursor
  if (cursorPos > 0) {
    const newValue = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
    display.value = newValue;
    
    // Move cursor back
    setTimeout(() => {
      display.setSelectionRange(cursorPos - 1, cursorPos - 1);
      display.focus();
    }, 0);
  }
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

// Keyboard support - only handle special keys
document.addEventListener("keydown", (e) => {
  const key = e.key;
  
  if (key === "Enter" || key === "=") {
    calculate();
    e.preventDefault();
  } else if (key === "Escape") {
    clearDisplay();
    e.preventDefault();
  }
  // Allow arrow keys, backspace, delete, and normal text input to work naturally
});