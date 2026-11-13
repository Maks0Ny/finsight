import numpy as np

class HuberLoss:
    
    def forward(self, y_true, y_pred, delta=1.0) -> float:
        
        error = y_true - y_pred
        abs_error = np.abs(error)
    
        quadratic_mask = abs_error <= delta
        
        quadratic_loss = 0.5 * (error ** 2)
        linear_loss = delta * (abs_error - 0.5 * delta)
        
        return np.where(quadratic_mask, quadratic_loss, linear_loss)
    
    
    def gradient(self, y_true, y_pred, delta=1.0) -> np.ndarray:
        
        error = y_true - y_pred
        abs_error = np.abs(error)
        
        quadratic_mask = abs_error <= delta
        
        gradient = np.where(quadratic_mask, -error, -delta * np.sign(error))
        
        return gradient / len(y_true)