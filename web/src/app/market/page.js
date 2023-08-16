"use client"

import Header from "../../components/Header";
import TokenList from "../../components/TokenList";
import { AccountContextProvider } from "@/context/AccountContext";

export default function Home() {
  return (
    <AccountContextProvider>
        <Header />
        <TokenList />
    </AccountContextProvider>
  );
}