import { useState, useEffect } from "react";
import { db } from "./firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth } from "./firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

function App() {
  // AUTH STATE
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // APP STATE
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [entries, setEntries] = useState([]);

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // FETCH DATA
  const fetchEntries = async () => {
    const snapshot = await getDocs(collection(db, "entries"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setEntries(data);
  };

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  // AUTH FUNCTION
  const handleAuth = async () => {
    if (!email || !password) return;

    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // ADD ENTRY
  const addEntry = async () => {
    if (!income || !expenses) return;

    await addDoc(collection(db, "entries"), {
      income: Number(income),
      expenses: Number(expenses),
      date: new Date().toISOString(),
    });

    setIncome("");
    setExpenses("");
    fetchEntries();
  };

  // DELETE ENTRY
  const deleteEntry = async (id) => {
    await deleteDoc(doc(db, "entries", id));
    fetchEntries();
  };

  // DATES
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const last7Days = new Date();
  last7Days.setDate(now.getDate() - 7);

  const last30Days = new Date();
  last30Days.setDate(now.getDate() - 30);

  // TODAY
  const todayEntries = entries.filter(
    (item) => item.date && item.date.startsWith(todayStr)
  );

  const totalIncome = todayEntries.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = todayEntries.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;

  // WEEK
  const weeklyEntries = entries.filter(
    (item) => new Date(item.date) >= last7Days
  );

  const weeklyIncome = weeklyEntries.reduce((sum, item) => sum + item.income, 0);
  const weeklyExpenses = weeklyEntries.reduce((sum, item) => sum + item.expenses, 0);
  const weeklyProfit = weeklyIncome - weeklyExpenses;

  // MONTH
  const monthlyEntries = entries.filter(
    (item) => new Date(item.date) >= last30Days
  );

  const monthlyIncome = monthlyEntries.reduce((sum, item) => sum + item.income, 0);
  const monthlyExpenses = monthlyEntries.reduce((sum, item) => sum + item.expenses, 0);
  const monthlyProfit = monthlyIncome - monthlyExpenses;

  const cardStyle = {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    background: "#1e1e1e",
  };

  // 🔴 LOGIN SCREEN (IF NOT LOGGED IN)
  if (!user) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: "auto", color: "white" }}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button onClick={handleAuth}>
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          style={{ cursor: "pointer", color: "lightblue" }}
        >
          {isLogin ? "Create account" : "Already have account? Login"}
        </p>
      </div>
    );
  }

  // 🟢 DASHBOARD (IF LOGGED IN)
  return (
    <div
      style={{
        padding: 20,
        maxWidth: 500,
        margin: "0 auto",
        fontFamily: "Arial",
        color: "white",
        background: "#111",
        minHeight: "100vh",
      }}
    >
      <h2>Money Tracker</h2>
      <h2>This site was built by Chiaha Daniel Chidera</h2>

      <button onClick={handleLogout}>Logout</button>

      {/* INPUT */}
      <div style={cardStyle}>
        <input
          placeholder="Income"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Expenses"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
        />

        <br /><br />

        <button onClick={addEntry}>Save Entry</button>
      </div>

      {/* TODAY */}
      <div style={cardStyle}>
        <h3>Today</h3>
        <p>Income: {totalIncome}</p>
        <p>Expenses: {totalExpenses}</p>
        <p style={{ color: totalProfit >= 0 ? "lightgreen" : "red" }}>
          Profit: {totalProfit}
        </p>
      </div>

      {/* WEEK */}
      <div style={cardStyle}>
        <h3>Weekly</h3>
        <p>Income: {weeklyIncome}</p>
        <p>Expenses: {weeklyExpenses}</p>
        <p style={{ color: weeklyProfit >= 0 ? "lightgreen" : "red" }}>
          Profit: {weeklyProfit}
        </p>
      </div>

      {/* MONTH */}
      <div style={cardStyle}>
        <h3>Monthly</h3>
        <p>Income: {monthlyIncome}</p>
        <p>Expenses: {monthlyExpenses}</p>
        <p style={{ color: monthlyProfit >= 0 ? "lightgreen" : "red" }}>
          Profit: {monthlyProfit}
        </p>
      </div>

      {/* INSIGHT */}
      <div style={cardStyle}>
        <h3>Insight</h3>
        {monthlyProfit >= 0 ? (
          <p>📈 You are growing. Keep going.</p>
        ) : (
          <p>📉 You are losing money. Reduce expenses.</p>
        )}
      </div>

      {/* HISTORY */}
      <h3>History</h3>

      {entries.map((item) => {
        const profit = item.income - item.expenses;

        return (
          <div key={item.id} style={{ marginBottom: 10 }}>
            <p>Income: {item.income}</p>
            <p>Expenses: {item.expenses}</p>
            <p style={{ color: profit >= 0 ? "lightgreen" : "red" }}>
              Profit: {profit}
            </p>
            <p>{new Date(item.date).toLocaleString()}</p>

            <button
              onClick={() => deleteEntry(item.id)}
              style={{
                marginTop: 5,
                background: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: 5,
              }}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default App;