import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("ecom_sim_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("ecom_sim_cart", JSON.stringify(cart));
  }, [cart]);

  // Add item or increment quantity if already in cart
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.product_id,
          display_name: product.display_name,
          image_url: product.image_url,
          category_en: product.category_en,
          price: Number(product.price),
          quantity,
        },
      ];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);