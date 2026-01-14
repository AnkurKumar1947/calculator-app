// API configuration
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Perform a calculation via the backend API
 */
export async function calculate(operation, operand1, operand2) {
  try {
    const response = await fetch(`${API_URL}/api/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation, operand1, operand2 }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Calculation failed');
    }

    return data.result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Evaluate a mathematical expression via the backend API
 */
export async function evaluate(expression) {
  try {
    const response = await fetch(`${API_URL}/api/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expression }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Evaluation failed');
    }

    return data.result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Check if the backend API is healthy
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
