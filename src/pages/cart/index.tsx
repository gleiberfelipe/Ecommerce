import { useSelector, useDispatch } from "react-redux";
import { addToCart, decreaseCart, removeFromCart, clearCart, } from "../../store/modules/cart";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Header } from "../../components/header";
import { RootState } from "../../store";
import Footer from "../../components/footer";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { DivMasterCart } from "./style";


interface Produto {
  id: number;
  nome: string;
  foto: string;
  descricao: string;
  preco: number;
  categoria: string;
}

function CartPage() {
  const [coupon, setCoupon] = useState("");

  const cart = useSelector((state) => state.cart);
  const token = useSelector((state: any) => state.user.token || '');
  const dispatch = useDispatch();
  const [products, setProducts] = useState<Produto[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = cart.cartItems.map((item) => item.id);
      const result = await api.get(
        `http://localhost:3000/produtos?ids=${productIds.join(",")}`
      );
      setProducts(result.data);
    };
    if (cart.cartItems.length > 0) {
      fetchProducts();
    }
  }, [cart]);


  async function handleCheckout(coupon: string | undefined) {
    await sendCartData(cart, token, coupon);
    console.log(token);
  }

  function Checkout() {
    const location = useLocation();
    const orderId = new URLSearchParams(location.search).get('id');
  }

  async function sendCartData(cart: RootState["cart"], token: string, coupon?: string) {
    const requestBody = {
      listaprodutos: cart.cartItems.map(item => {
        return { idproduto: item.id, quantidade: item.cartQuantity };
      }),
    };

    if (coupon) {
      requestBody["nomeCupom"] = coupon;
    }

    try {
      const response = await api.post("http://localhost:3000/pedidos",
        requestBody,
        {
          headers: {
            "Content-Type": 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      ).then(response => {
        if (response.status = 201) {
          const pedidoId = response.data[0].id;
          console.log(pedidoId);
          alert('checkout successful!');
          handleClearCart();
          navigate('/checkout' + '?id=' + `${pedidoId}`);
        } else {
          throw new Error('Error signing up');
        }
      });
      console.log(response.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };



  function handleIncrease(product) {
    dispatch(addToCart(product));
  }

  function handleDecrease(product) {
    const item = cart.cartItems.find((item) => item.id === product.id);
    if (item.cartQuantity > 1) {
      dispatch(decreaseCart(product));
    }
  }

  function handleRemove(product) {
    dispatch(removeFromCart(product));
  }

  function handleClearCart() {
    dispatch(clearCart());
  }

  function getProductPrice(id: number): number {
    const product = products.find((p) => p.id === id);
    if (product) {
      return product.preco;
    }
    return 0;
  }

  function getProductTotalPrice(id: number): number {
    const item = cart.cartItems.find((i) => i.id === id);
    if (item) {
      return item.cartQuantity * getProductPrice(id);
    }
    return 0;
  }


  const [couponError, setCouponError] = useState(null);


  async function handleVerifyCoupon(coupon: string) {
    event?.preventDefault();

    try {
      const response = await api.get(`http://localhost:3000/cupons?nome=${coupon}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        console.log("Coupon found");
        setCouponError(null);
      } else {
        console.log("Coupon not found");
        setCouponError("Invalid coupon");
      }
    } catch (error) {
      console.log(error);
      setCouponError("Error verifying coupon");
    }
  };

  return (
    <>
      <Header />
      <DivMasterCart>
        <h1>Carrinho</h1>
        {cart.cartItems.length === 0 ? (
          <section>
            <p>Seu carrinho está vazio!</p>
            <NavLink to="/products" ><button> Voltar a Loja</button></NavLink>
          </section>
        ) : (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Produto</th>
                  <th>Preço unitário</th>
                  <th>Quantidade</th>
                  <th>Total parcial</th>
                  <th>Remover</th>
                </tr>
              </thead>
              <tbody>
                {cart.cartItems.map((item) => {
                  const product = products.find((p) => p.id === item.id);
                  if (!product) return null;
                  const unitPrice = getProductPrice(item.id);
                  const totalProductPrice = getProductTotalPrice(item.id);
                  return (

                    <tr key={product.id}>
                      <td><img src={product.foto} alt="" /></td>
                      <td>{product.nome}</td>
                      <td>R${unitPrice.toFixed(2)}</td>
                      <td>
                        <button  onClick={() => handleDecrease(product)}>
                          -
                        </button>
                        {item.cartQuantity}
                        <button onClick={() => handleIncrease(product)}>
                          +
                        </button>
                      </td>
                      <td>R${totalProductPrice.toFixed(2)}</td>
                      <td>
                        <button onClick={() => handleRemove(product)}>X</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="total">
                    Quantidade de produtos: {cart.cartTotalQuantity} | Valor total: R$
                    {cart.cartTotalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <form>
              <label>
                Código do cupom:
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
              </label>
              <button type="button" onClick={() => handleVerifyCoupon(coupon)}>
                Verificar
              </button>
              {couponError && <p>{couponError}</p>}
            </form>


            <div  className="keep-shopping">
              <button onClick={handleClearCart}>Limpar carinho</button>
              <NavLink to="/products"> <button>Continuar Comprando</button></NavLink>
              <button onClick={() => handleCheckout(coupon)}>Check out</button>
            </div>
          </div>
        )}
      </DivMasterCart>
      <Footer />
    </>
  );
}

export default CartPage;
