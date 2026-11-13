import numpy as np

class MSELoss:
    
    def forward(self, y_true, y_pred):
        return np.mean((y_true - y_pred) ** 2)
    
    def gradient(self, y_true, y_pred):
        n = len(y_true)
        return (2/n) * (y_pred - y_true)
        
    