"use client"

import Header from "../../components/Header";
import Minter from "../../components/Minter";
import { AccountContextProvider } from "@/context/AccountContext";

export default function Home() {
  return (
    <AccountContextProvider>
        <Header />
        <Minter />
    </AccountContextProvider>
  );
}
