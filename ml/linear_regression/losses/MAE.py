import numpy as np

class MAELoss:
    
    def forward(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        
        return np.mean(np.abs(y_true - y_pred))
    
    def gradient(self, y_true: np.ndarray, y_pred: np.ndarray) -> np.ndarray:
        n = len(y_true)
        
        return np.sign(y_pred, y_true) / n