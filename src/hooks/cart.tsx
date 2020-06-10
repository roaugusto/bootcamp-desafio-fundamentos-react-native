import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const findProduct = products.find(item => item.id === product.id);

      if (findProduct) {
        // const indexProduct = products.findIndex(item => item.id === product.id);
        // const listProducts = products;
        // listProducts[indexProduct].quantity += 1;
        // setProducts(listProducts);
        setProducts(
          products.map(item =>
            item.id === product.id
              ? { ...product, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        // const newProduct = product;
        // newProduct.quantity = 1;
        // setProducts(state => [...state, newProduct]);
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // const indexProduct = products.findIndex(item => item.id === id);
      // const listProducts = products;
      // listProducts[indexProduct].quantity += 1;
      // setProducts(listProducts);

      setProducts(
        products.map(item =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // const product = products.find(item => item.id === id);

      // if (product?.quantity === 1) {
      //   setProducts(products.filter(item => item.id !== id));
      //   return;
      // }

      // const listProducts = products;
      // listProducts[indexProduct].quantity -= 1;

      // if (listProducts[indexProduct].quantity === 0) {
      //   listProducts.splice(indexProduct, 1);
      // }

      // setProducts(listProducts);

      setProducts(
        products.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        ),
      );

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
