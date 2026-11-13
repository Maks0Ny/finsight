import numpy as np

class LinearRegression:
    
    def __init__(self):
        self.weights = None
        self.bias = 0
        self.is_fitted = False
        
        
    def initialize_weights(self, n_features: int) -> None:
        self.weights = np.zeros(n_features)
        self.bias = 0.0
        
        
    def forward(self, X: np.ndarray) -> np.ndarray:
        return np.dot(X, self.weights) + self.bias
    
    
    def backward(self,  X: np.ndarray, grad_output: np.ndarray) -> tuple:
        
        dw = X.T @ grad_output
        db = np.sum(grad_output)
        
        return dw, db        
    
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        if self.weights is None:
            raise ValueError("Model is not fitted yet. Please call the 'fit' method first.")
        
        return self.forward(X)