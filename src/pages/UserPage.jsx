import { useState } from "react";
import styles from "./UserPage.module.css";

import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { MENU_ITEMS } from "../data/menu";

export default function UserPage() {
  const [currentStep, setCurrentStep] = useState("select");
  const [cart, setCart] = useState([]);
  const [orderNumber, setOrderNumber] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [myHistory, setMyHistory] = useState([]);

  const [flyingItemId, setFlyingItemId] = useState(null);

  // 履歴を見る関数
  const openHistoryModal = () => {
    // 過去の履歴をローカルから取り出す
    const savedHistory = JSON.parse(localStorage.getItem("myOrders") || "[]");
    setMyHistory(savedHistory);
    setIsHistoryModalOpen(true);
  };

  // カートに入れる関数
  const handleAddToCart = (item) => {
    setCart([...cart, item]);

    // カードの中にある画像タグを取得
    setFlyingItemId(item.id);

    setTimeout(() => {
      setFlyingItemId(null);
    }, 500);
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

      // ローカルに注文番号を保存
      setOrderNumber(newOrder.orderNumber);
      const existingHistory = JSON.parse(
        localStorage.getItem("myOrders") || "[]",
      );

      //「今日の0時0分0秒」の時刻を取得する
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // 時間・分・秒・ミリ秒をすべて0にする

      // 既存の履歴から「今日（todayStart）以降のもの」だけをフィルタリングして残す
      const todayHistory = existingHistory.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= todayStart; // 今日作ったものだけ残す
      });

      const newHistory = [
        {
          orderNumber: newOrder.orderNumber,
          createdAt: new Date().toISOString(),
        },
        ...todayHistory,
      ];
      localStorage.setItem("myOrders", JSON.stringify(newHistory));

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
            <div className={styles.header}>
              <h1 className={styles.title}>新潟〇〇店でご注文</h1>
              <button
                onClick={openHistoryModal}
                className={styles.historyOpenBtn}
              >
                注文履歴
              </button>
            </div>
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
                    {flyingItemId === item.id && (
                      <img
                        src={item.thumbnail}
                        alt="flying"
                        className={styles.flyingThumbnail}
                      />
                    )}
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

      {/* 自分の注文履歴モーダル */}
      {isHistoryModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ご自身の注文履歴</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setIsHistoryModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {myHistory.length === 0 ? (
                <p className={styles.noHistory}>過去の注文履歴はありません</p>
              ) : (
                myHistory.map((order, index) => (
                  <div className={styles.historyCard} key={index}>
                    <span className={styles.historyNum}>
                      #{order.orderNumber}
                    </span>
                    <span className={styles.historyTime}>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      注文
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
