import { ReactNode, useEffect, useState } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';
import { useCart } from '../../hooks/useCart';
import { api } from '../../services/api';
import { formatPrice } from "../../util/format";
import { Container } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount?: number;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

export const ProductsList = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    // TODO
    const newSumAmount = { ...sumAmount };
    newSumAmount[product.id] = product.amount;

    return newSumAmount;
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      // TODO
      const response = await api.get<Product[]>('products');

      const data = response.data.map(product => ({
        ...product,
        priceFormatted: formatPrice(product.price)
      }));

      setProducts(data);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    // TODO
    addProduct(id);
  }

  return (
    <Container>
      {products.map(product => (
        <li key={product.id}>
          <img src={product.image} />
          <strong>{product.title}</strong>
          <span>{product.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
          onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
      <li key={99}>
          <img src={'https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis2.jpg'} />
          <strong>{'Não existe'}</strong>
          <span>{'999,99'}</span>
          <button
            type="button"
            data-testid="add-product-button"
          onClick={() => handleAddProduct(99)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[99] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
    </Container>
  );
};
