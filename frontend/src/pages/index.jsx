
import Router from "next/router";
import styles from "@/styles/home.module.css";
export default function Home() {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.containerLeft}>
            <p>Connect with friends without Exaggeration </p>
            <p>A true social media platform, with no bluffs</p>
            <button className="btn primaryBtn buttonJoin" onClick={() => Router.push("/login")}>Join Now</button>
          </div>

          <div className={styles.containerRight}>
            <img src="images/homemain_connection.png" alt="main-connection" />
          </div>
        </div>
      </div>

    </>
  );
}
