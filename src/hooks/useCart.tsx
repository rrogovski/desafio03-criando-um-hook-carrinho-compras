import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    addProductToLocalStorage();
  }, [cart])

  const hasQuantityInStock = async (productId: number, amount: number) => {
    await api.get(`stock?id=${productId}`)
    .then(response => {
      return amount > response.data[0].amount;
    }).catch(error => {
      toast.error('Erro na consulta de estoque!');
      return false;
    })
  }

  const addProduct = async (productId: number) => {
    try {
      const cartUpdated = [...cart];
      const productExistsInCart = cartUpdated.find(product => product.id === productId);

      const responseStock = await api.get(`stock/${productId}`)
      const stock = responseStock.data;
      const currentAmount = productExistsInCart ? productExistsInCart.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (productExistsInCart) {
        productExistsInCart.amount = amount;
      } else {
        const responseProduct = await api.get(`products/${productId}`);
        const newProdcut = { ...responseProduct.data, amount};
        cartUpdated.push(newProdcut);
      }


      setCart(cartUpdated);
    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartUpdated = [...cart];
      const carFiltred = cartUpdated.filter(product => product.id !== productId)
      setCart(carFiltred);
      toast.success('Item removido!');
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const responseStock = await api.get(`stock/${productId}`)
      const stock = responseStock.data;

      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const cartUpdate = [...cart];
      const productUpdated = cartUpdate.find(product => product.id === productId);

      if (!!productUpdated) {
        productUpdated.amount = amount;
        setCart(cartUpdate);
      }
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  const addProductToLocalStorage = () => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
