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
  promoCode?: any;
  discountAmount?: number;
  total?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Country {
  id: number;
  code: string;
  name: string;
  flag: string;
  isoCode: string;
  region: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // API Gateway routes to MS_ORDER on port 8080
  private baseUrl = 'http://localhost:8088/api/orders';
  private countryUrl = 'http://localhost:8088/api/countries';

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
  addToCart(
    userId: number,
    articleId: number,
    articleName: string,
    price: number,
    quantity: number
  ): Observable<Order> {
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
    return this.http.delete<Order>(
      `${this.baseUrl}/cart/${userId}/item/${itemId}`
    );
  }

  // Confirm order
  confirmOrder(userId: number, promoCode?: string): Observable<Order> {
    let params = new HttpParams();
    if (promoCode) {
      params = params.set('promoCode', promoCode);
    }
    return this.http.post<Order>(
      `${this.baseUrl}/cart/${userId}/confirm`,
      {},
      { params }
    );
  }

  // Update order status
  updateStatus(orderId: number, status: string): Observable<Order> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Order>(
      `${this.baseUrl}/${orderId}/status`,
      {},
      { params }
    );
  }

  // Cancel/Delete order
  cancelOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${orderId}`);
  }

  // Backend accepts: CART, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  normalizeBackendStatus(status: string): string {
    return (status || '').toUpperCase().trim();
  }

  // ==================== COUNTRY API ====================

  // Get all active countries (for phone dropdown)
  getActiveCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.countryUrl}/active`);
  }

  // Get all countries
  getAllCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.countryUrl}`);
  }

  // Get country by code
  getCountryByCode(code: string): Observable<Country> {
    return this.http.get<Country>(`${this.countryUrl}/code/${code}`);
  }
}
