import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartBatch, setCartBatch] = useState(() => {
    const savedBatch = localStorage.getItem('cartBatch');
    return savedBatch ? JSON.parse(savedBatch) : null;
  });

  const [cartItems, setCartItems] = useState(() => {
    const savedItems = localStorage.getItem('cartItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // Sync with localStorage
  useEffect(() => {
    if (cartItems.length > 0 && cartBatch) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      localStorage.setItem('cartBatch', JSON.stringify(cartBatch));
    } else {
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartBatch');
    }
  }, [cartItems, cartBatch]);

  // Add item to cart
  const addToCart = (batch, batchItem, quantityToAdd = 1) => {
    // If cart has items from another batch, confirm replacement
    if (cartBatch && cartBatch._id !== batch._id && cartItems.length > 0) {
      const confirmSwitch = window.confirm(
        `Your cart contains items from "${cartBatch.batchName}". Since pre-orders are prepared per batch, adding items from "${batch.batchName}" will reset your cart. Do you wish to continue?`
      );
      if (!confirmSwitch) return false;

      // Reset cart
      setCartBatch(batch);
      setCartItems([
        {
          batchItemId: batchItem._id,
          product: batchItem.product,
          price: batchItem.price,
          quantity: Math.min(
            quantityToAdd,
            batchItem.availableQuantity,
            batchItem.maxOrderPerCustomer || 10
          ),
          availableQuantity: batchItem.availableQuantity,
          maxOrder: batchItem.maxOrderPerCustomer || 10,
          minOrder: batchItem.minOrderPerCustomer || 1,
        },
      ]);
      toast.success(`Started new pre-order cart for "${batch.batchName}"`);
      return true;
    }

    setCartBatch(batch);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.batchItemId === batchItem._id
      );

      if (existingIndex > -1) {
        const item = prevItems[existingIndex];
        const newQty = item.quantity + quantityToAdd;
        const maxLimit = Math.min(
          batchItem.availableQuantity,
          batchItem.maxOrderPerCustomer || 10
        );

        if (newQty > maxLimit) {
          toast.warning(`Maximum available limit of ${maxLimit} reached for this item.`);
          const updated = [...prevItems];
          updated[existingIndex].quantity = maxLimit;
          return updated;
        }

        const updated = [...prevItems];
        updated[existingIndex].quantity = newQty;
        toast.info(`Updated "${batchItem.product.name}" quantity to ${newQty}`);
        return updated;
      } else {
        const initialQty = Math.min(
          quantityToAdd,
          batchItem.availableQuantity,
          batchItem.maxOrderPerCustomer || 10
        );
        toast.success(`Added "${batchItem.product.name}" to cart`);
        return [
          ...prevItems,
          {
            batchItemId: batchItem._id,
            product: batchItem.product,
            price: batchItem.price,
            quantity: initialQty,
            availableQuantity: batchItem.availableQuantity,
            maxOrder: batchItem.maxOrderPerCustomer || 10,
            minOrder: batchItem.minOrderPerCustomer || 1,
          },
        ];
      }
    });

    return true;
  };

  // Update item quantity
  const updateQuantity = (batchItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(batchItemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.batchItemId === batchItemId) {
          const maxLimit = Math.min(item.availableQuantity, item.maxOrder);
          const clamped = Math.min(Math.max(newQty, item.minOrder || 1), maxLimit);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  // Remove single item
  const removeFromCart = (batchItemId) => {
    setCartItems((prevItems) => {
      const remaining = prevItems.filter((i) => i.batchItemId !== batchItemId);
      if (remaining.length === 0) {
        setCartBatch(null);
      }
      return remaining;
    });
    toast.info('Item removed from cart');
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    setCartBatch(null);
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartBatch');
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartBatch,
        cartItems,
        totalItems,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
