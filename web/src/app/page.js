"use client"

import styles from "./page.module.css";
import Header from "../components/Header";
import { AccountContextProvider } from "@/context/AccountContext";

export default function Home() {
  return (
    <AccountContextProvider>
        <Header />
    </AccountContextProvider>
  );
}
