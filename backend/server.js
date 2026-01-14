import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(null, true); // Be permissive for now, tighten in production
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Calculator operations
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  },
  percentage: (a) => a / 100,
  negate: (a) => -a,
  sqrt: (a) => {
    if (a < 0) throw new Error('Cannot calculate square root of negative number');
    return Math.sqrt(a);
  },
  power: (a, b) => Math.pow(a, b),
};

// Main calculate endpoint
app.post('/api/calculate', (req, res) => {
  try {
    const { operation, operand1, operand2 } = req.body;

    // Validate input
    if (!operation) {
      return res.status(400).json({ 
        error: 'Operation is required',
        validOperations: Object.keys(operations)
      });
    }

    if (operand1 === undefined || operand1 === null) {
      return res.status(400).json({ error: 'operand1 is required' });
    }

    const num1 = parseFloat(operand1);
    if (isNaN(num1)) {
      return res.status(400).json({ error: 'operand1 must be a valid number' });
    }

    // Check if operation exists
    if (!operations[operation]) {
      return res.status(400).json({ 
        error: `Unknown operation: ${operation}`,
        validOperations: Object.keys(operations)
      });
    }

    let result;

    // Single operand operations
    if (['percentage', 'negate', 'sqrt'].includes(operation)) {
      result = operations[operation](num1);
    } else {
      // Two operand operations
      if (operand2 === undefined || operand2 === null) {
        return res.status(400).json({ error: 'operand2 is required for this operation' });
      }

      const num2 = parseFloat(operand2);
      if (isNaN(num2)) {
        return res.status(400).json({ error: 'operand2 must be a valid number' });
      }

      result = operations[operation](num1, num2);
    }

    // Handle special cases
    if (!isFinite(result)) {
      return res.status(400).json({ error: 'Result is not a finite number' });
    }

    // Round to avoid floating point precision issues
    const roundedResult = Math.round(result * 1e10) / 1e10;

    console.log(`[Calculate] ${operation}(${num1}${operand2 !== undefined ? ', ' + operand2 : ''}) = ${roundedResult}`);

    res.json({ 
      result: roundedResult,
      operation,
      operand1: num1,
      operand2: operand2 !== undefined ? parseFloat(operand2) : undefined
    });

  } catch (error) {
    console.error('[Calculate Error]', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Evaluate expression endpoint (for simple expressions)
app.post('/api/evaluate', (req, res) => {
  try {
    const { expression } = req.body;

    if (!expression || typeof expression !== 'string') {
      return res.status(400).json({ error: 'Expression string is required' });
    }

    // Sanitize: only allow numbers, operators, parentheses, and decimal points
    const sanitized = expression.replace(/\s/g, '');
    if (!/^[\d+\-*/.()]+$/.test(sanitized)) {
      return res.status(400).json({ error: 'Invalid characters in expression' });
    }

    // Evaluate safely
    const result = Function('"use strict"; return (' + sanitized + ')')();

    if (!isFinite(result)) {
      return res.status(400).json({ error: 'Result is not a finite number' });
    }

    const roundedResult = Math.round(result * 1e10) / 1e10;

    console.log(`[Evaluate] ${expression} = ${roundedResult}`);

    res.json({ result: roundedResult, expression });

  } catch (error) {
    console.error('[Evaluate Error]', error.message);
    res.status(400).json({ error: 'Invalid expression' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🧮 Calculator API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Calculate: POST http://localhost:${PORT}/api/calculate`);
  console.log(`   Evaluate: POST http://localhost:${PORT}/api/evaluate`);
});
