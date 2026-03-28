import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  id?: number;
  articleId: number;
  articleName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  items: OrderItem[];
  total?: number;
  createdAt: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  // Get all orders (for admin)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`);
  }

  // Get orders by user ID
  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/user/${userId}`);
  }

  // Get a specific order
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }

  // Get cart
  getCart(userId: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/cart/${userId}`);
  }

  // Add to cart
  addToCart(userId: number, articleId: number, articleName: string, 
            price: number, quantity: number): Observable<Order> {
    const params = new HttpParams()
      .set('articleId', articleId.toString())
      .set('articleName', articleName)
      .set('price', price.toString())
      .set('quantity', quantity.toString());

    return this.http.post<Order>(
      `${this.baseUrl}/cart/${userId}/add`,
      {},
      { params }
    );
  }

  // Remove from cart
  removeFromCart(userId: number, itemId: number): Observable<Order> {
    return this.http.delete<Order>(`${this.baseUrl}/cart/${userId}/item/${itemId}`);
  }

  // Confirm order
  confirmOrder(userId: number): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/cart/${userId}/confirm`, {});
  }

  // Update order status
  updateStatus(orderId: number, status: string): Observable<Order> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Order>(`${this.baseUrl}/${orderId}/status`, {}, { params });
  }

  // Cancel/Delete order
  cancelOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${orderId}`);
  }
}
