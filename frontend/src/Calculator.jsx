import { useState, useCallback, useEffect } from 'react';
import { calculate } from './api';
import './Calculator.css';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map display symbols to API operations
  const operationMap = {
    '+': 'add',
    '−': 'subtract',
    '×': 'multiply',
    '÷': 'divide',
  };

  const handleDigit = useCallback((digit) => {
    setError(null);
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const handleDecimal = useCallback(() => {
    setError(null);
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const handleOperator = useCallback(async (nextOperator) => {
    setError(null);
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setHistory(`${inputValue} ${nextOperator}`);
    } else if (operation && !waitingForOperand) {
      // Perform the pending calculation
      setIsLoading(true);
      try {
        const apiOperation = operationMap[operation];
        const result = await calculate(apiOperation, previousValue, inputValue);
        setDisplay(String(result));
        setPreviousValue(result);
        setHistory(`${result} ${nextOperator}`);
      } catch (err) {
        setError(err.message);
        setDisplay('Error');
      } finally {
        setIsLoading(false);
      }
    } else {
      setHistory(`${previousValue} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOperator);
  }, [display, operation, previousValue, waitingForOperand]);

  const handleEquals = useCallback(async () => {
    if (operation === null || previousValue === null || waitingForOperand) {
      return;
    }

    setError(null);
    setIsLoading(true);
    const inputValue = parseFloat(display);

    try {
      const apiOperation = operationMap[operation];
      const result = await calculate(apiOperation, previousValue, inputValue);
      setHistory(`${previousValue} ${operation} ${inputValue} =`);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    } catch (err) {
      setError(err.message);
      setDisplay('Error');
    } finally {
      setIsLoading(false);
    }
  }, [display, operation, previousValue, waitingForOperand]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setHistory('');
    setError(null);
  }, []);

  const handleClearEntry = useCallback(() => {
    setDisplay('0');
    setError(null);
  }, []);

  const handleToggleSign = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await calculate('negate', parseFloat(display));
      setDisplay(String(result));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [display]);

  const handlePercentage = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await calculate('percentage', parseFloat(display));
      setDisplay(String(result));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [display]);

  const handleBackspace = useCallback(() => {
    setError(null);
    if (display.length === 1 || (display.length === 2 && display[0] === '-')) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('−');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === '%') {
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDecimal, handleOperator, handleEquals, handleClear, handleBackspace, handlePercentage]);

  const Button = ({ children, onClick, className = '', disabled = false }) => (
    <button
      className={`calc-button ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {children}
    </button>
  );

  return (
    <div className="calculator">
      {/* Display */}
      <div className="display-container">
        <div className="display-history">{history}</div>
        <div className={`display-main ${isLoading ? 'loading' : ''} ${error ? 'error' : ''}`}>
          {isLoading ? (
            <span className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          ) : (
            display
          )}
        </div>
        {error && <div className="display-error">{error}</div>}
      </div>

      {/* Buttons */}
      <div className="buttons-grid">
        {/* Row 1 */}
        <Button onClick={handleClear} className="function">AC</Button>
        <Button onClick={handleClearEntry} className="function">CE</Button>
        <Button onClick={handlePercentage} className="function">%</Button>
        <Button onClick={() => handleOperator('÷')} className="operator">÷</Button>

        {/* Row 2 */}
        <Button onClick={() => handleDigit('7')} className="digit">7</Button>
        <Button onClick={() => handleDigit('8')} className="digit">8</Button>
        <Button onClick={() => handleDigit('9')} className="digit">9</Button>
        <Button onClick={() => handleOperator('×')} className="operator">×</Button>

        {/* Row 3 */}
        <Button onClick={() => handleDigit('4')} className="digit">4</Button>
        <Button onClick={() => handleDigit('5')} className="digit">5</Button>
        <Button onClick={() => handleDigit('6')} className="digit">6</Button>
        <Button onClick={() => handleOperator('−')} className="operator">−</Button>

        {/* Row 4 */}
        <Button onClick={() => handleDigit('1')} className="digit">1</Button>
        <Button onClick={() => handleDigit('2')} className="digit">2</Button>
        <Button onClick={() => handleDigit('3')} className="digit">3</Button>
        <Button onClick={() => handleOperator('+')} className="operator">+</Button>

        {/* Row 5 */}
        <Button onClick={handleToggleSign} className="digit">±</Button>
        <Button onClick={() => handleDigit('0')} className="digit">0</Button>
        <Button onClick={handleDecimal} className="digit">.</Button>
        <Button onClick={handleEquals} className="equals">=</Button>
      </div>
    </div>
  );
};

export default Calculator;
