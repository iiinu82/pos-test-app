import { useState } from "react";
import styles from "./UserPage.module.css";

import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { MENU_ITEMS } from "../data/menu";

export default function UserPage() {
  const [currentStep, setCurrentStep] = useState("select");
  const [cart, setCart] = useState([]);
  const [orderNumber, setOrderNumber] = useState(null);

  // カートに入れる関数
  const handleAddToCart = (item) => {
    setCart([...cart, item]);
  };

  // 注文完了する関数
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const orderItems = cart.map((item) => ({
        name: item.name,
        thumbnail: item.thumbnail,
        isCompleted: false,
      }));

      const newOrder = {
        items: orderItems,
        status: "pending",
        orderNumber: Math.floor(Math.random() * 900) + 100,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), newOrder);

      setOrderNumber(newOrder.orderNumber);

      setCurrentStep("completed");
    } catch (e) {
      console.error("注文の保存に失敗しました: ", e);
      alert("注文に失敗しました。コンソールを確認してください。");
    }
  };

  return (
    <>
      <div className={styles.mobileContainer}>
        {/* ステップ1: 商品選択＝＞カートに入れる画面 */}
        {currentStep === "select" && (
          <>
            <h1 className={styles.title}>新潟〇〇店でご注文</h1>
            <div className={styles.menuArea}>
              <div className={styles.cardArea}>
                {MENU_ITEMS.map((item) => (
                  <div className={styles.card} key={item.id}>
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className={styles.thumbnail}
                    />
                    <div className={styles.menuTitle}>{item.name}</div>
                    <button
                      className={styles.addCart}
                      onClick={() => handleAddToCart(item)}
                    >
                      カートに入れる
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.footerArea}>
              <p>
                カート内に<span>{cart.length}品</span>入っています
              </p>
              <button
                className={styles.proceedCheckout}
                onClick={() => setCurrentStep("confirm")}
                disabled={cart.length === 0}
              >
                注文に進む
              </button>
            </div>
          </>
        )}

        {/* ステップ2: 注文確認画面 */}
        {currentStep === "confirm" && (
          <>
            <h2>ご注文内容の確認</h2>
            <div className={styles.confirmOrder}>
              {cart.map((item, index) => (
                <div className={styles.confirmCard} key={index}>
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className={styles.confirmThumbnail}
                  />
                  <div className={styles.confirmMenuTitle}>{item.name}</div>
                </div>
              ))}
            </div>
            <div className={styles.btnArea}>
              <button
                className={styles.backBtn}
                onClick={() => setCurrentStep("select")}
              >
                戻る
              </button>
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                注文する
              </button>
            </div>
          </>
        )}

        {/* ステップ3: 注文完了画面＝＞注文番号を表示*/}
        {currentStep === "completed" && (
          <>
            <div className={styles.orderNumContainer}>
              <p className={styles.orderNumDesc}>ご注文番号</p>
              <p className={styles.orderNum}>{orderNumber}</p>
              <p className={styles.orderText}>ただいまお作りしております</p>
              <p className={styles.orderText}>
                番号がディスプレイに表示されましたら
                <br />
                カウンターでお受け取り下さい
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
