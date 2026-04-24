// Product Service - Ready for Django REST Framework integration

export const productService = {
  async getProducts() {
    // TODO: Replace with axios.get('/api/products/')
    return [
      { id: '1', name: 'Product A', barcode: '123456', category: 'Electronics', price: 500, stock: 10 },
      { id: '2', name: 'Product B', barcode: '789012', category: 'Food', price: 50, stock: 3 },
    ];
  },

  async getProductById(id) {
    // TODO: Replace with axios.get(`/api/products/${id}/`)
    return { id, name: 'Product A', barcode: '123456', category: 'Electronics', price: 500, stock: 10 };
  },

  async updateStock(productId, quantity) {
    // TODO: Replace with axios.patch(`/api/products/${productId}/stock/`, { quantity })
    return { id: productId, stock: quantity };
  },

  async createProduct(data) {
    // TODO: Replace with axios.post('/api/products/', data)
    return { ...data, id: Date.now().toString() };
  },

  async updateProduct(id, data) {
    // TODO: Replace with axios.put(`/api/products/${id}/`, data)
    return { id, ...data };
  },

  async deleteProduct(id) {
    // TODO: Replace with axios.delete(`/api/products/${id}/`)
    return { success: true };
  },

  async getLowStockProducts() {
    // TODO: Replace with axios.get('/api/products/low-stock/')
    return [
      { id: '2', name: 'Product B', stock: 3 },
      { id: '4', name: 'Product D', stock: 2 },
    ];
  },
};
