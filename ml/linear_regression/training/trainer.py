from configs import LEARNING_RATE, EPOCHS
import numpy as np


class Trainer:
    
    def __init__(self, model, loss, optimizer, epochs=EPOCHS):
        self.model = model
        self.loss = loss
        self.optimizer = optimizer
        self.epochs = epochs
        
        self.loss_history = []
        
        
    def fit(self, X: np.ndarray, y: np.ndarray) -> list:
        
        # Инициализация параметров модели
        self.model.initialize_parameters(X.shape[1])

        for _ in range(self.epochs):

            # Предсказание модели
            y_pred = self.model.forward(X)

            # Вычисление значения функции потерь
            loss_value = self.loss.forward(y, y_pred)

            # Вычисление градиента функции потерь
            grad_output = self.loss.gradient(y, y_pred)

            # Вычисление градиентов весов и смещения модели
            dw, db = self.model.backward(X, grad_output)

            # Шаг оптимизации: обновление весов и смещения модели с использованием градиентного спуска
            self.optimizer.step(self.model, dw, db)

            # Сохранение значения функции потерь для анализа
            self.loss_history.append(loss_value)

        return self.loss_history