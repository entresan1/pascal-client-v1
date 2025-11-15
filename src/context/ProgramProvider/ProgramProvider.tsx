import { AnchorProvider, Program } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import React, { ReactNode, useEffect, useReducer, useState } from "react";
import { ProgramActionTypes, reducer } from "./reducer";
import { ProgramContext, initalState } from "./state";

type ProgramProviderProps = {
  children: ReactNode;
};

export const ProgramProvider = ({ children }: ProgramProviderProps) => {
  const [program, dispatch] = useReducer(reducer, initalState);
  const [provider, setProvider] = useState<AnchorProvider | null>(null);
  const wallet = useWallet();
  
  // Create connection once
  const connection = React.useMemo(
    () =>
      new Connection(
        process.env.NEXT_PUBLIC_NODE || "https://api.mainnet-beta.solana.com",
        { commitment: "confirmed" }
      ),
    []
  );

  // Create provider when wallet connects
  useEffect(() => {
    if (wallet.publicKey && connection) {
      try {
        const newProvider = new AnchorProvider(
          connection,
          wallet as any,
          AnchorProvider.defaultOptions()
        );
        setProvider(newProvider);
      } catch (error) {
        console.error("Error creating provider:", error);
        setProvider(null);
      }
    } else {
      setProvider(null);
      // Clear program when wallet disconnects
      dispatch({ type: ProgramActionTypes.CLEAR_PROGRAM });
    }
  }, [wallet.publicKey?.toString(), wallet.connected, connection]);

  // Load program when provider and wallet are ready
  useEffect(() => {
    const loadProgram = async () => {
      // Check if PROGRAM_ID is set
      if (!process.env.NEXT_PUBLIC_PROGRAM_ID) {
        console.warn("NEXT_PUBLIC_PROGRAM_ID is not set. Program will not be loaded.");
        return;
      }

      if (!provider || !wallet.publicKey) {
        return;
      }

      try {
        const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);
        const loadedProgram = await Program.at(programId, provider);
        dispatch({
          type: ProgramActionTypes.SET_PROGRAM,
          payload: loadedProgram,
        });
        console.log("Program loaded successfully", loadedProgram);
      } catch (error) {
        console.error("Error loading program:", error);
        // Don't throw - just log the error
        // The program will remain null, and components should handle this
      }
    };

    loadProgram();
  }, [provider, wallet.publicKey?.toString()]);

  return (
    <ProgramContext.Provider value={program}>
      {children}
    </ProgramContext.Provider>
  );
};
