/**
 * Dummy Razorpay Integration
 * Simulates payment processing with an 80% success rate.
 */
export const simulatePayment = (amount: number): Promise<{ status: 'success' | 'failed'; paymentId?: string; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 80% chance of success
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        resolve({
          status: 'success',
          paymentId: `pay_dummy_${Math.random().toString(36).substring(7)}`,
          message: 'Payment simulated successfully'
        });
      } else {
        resolve({
          status: 'failed',
          message: 'Payment failed due to insufficient funds or network error'
        });
      }
    }, 2000); // Simulate network delay
  });
};
