import React, { useState, useContext } from "react";
import {
  Box,
  Text,
  useColorModeValue as mode,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalCloseButton,
} from "@chakra-ui/react";
import { Formik } from "formik";
import * as yup from "yup";
import { MotionConfig } from "framer-motion";
import { getMarket } from "@monaco-protocol/client";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  createMarket,
  openMarket,
  MarketType,
  initialiseOutcomes,
  batchAddPricesToAllOutcomePools,
  checkOperatorRoles,
} from "@monaco-protocol/admin-client";
import { Form1, Form2, SubmittedForm, FormStepper } from "./StepForms";
import { useWallet } from "@solana/wallet-adapter-react";
import { getPriceData, logResponse } from "@/utils/monaco";
import { ResizablePanel } from "../common/ResizablePanel";
import { PRICE_LADDER, usdcMint } from "@/utils/constants";
import { ProgramContext } from "@/context/ProgramProvider/state";

import styles from "@/styles/Home.module.css";

enum CreateStatus {
  CreatingMarket = "Creating Market",
  InitialisingOutcomes = "Initialising Outcomes",
  AddingPrices = "Adding Prices",
  OpeningMarket = "Opening Market",
  MakingMarket = "Making Market",
  Success = "Success",
}

const headers = { "Content-Type": "application/json" };
if (process.env.CREATE_MARKET_API_KEY) {
  headers["X-API-KEY"] = process.env.CREATE_MARKET_API_KEY;
}

async function createVerboseMarket(
  program,
  marketName,
  lockTimestamp,
  setCreateStatus
) {
  // Validate program
  if (!program || !program.provider) {
    throw new Error("Program not initialized. Please ensure your wallet is connected.");
  }

  if (!program.provider.publicKey) {
    throw new Error("Wallet not connected. Please connect your wallet to create a market.");
  }

  // Check operator roles - but allow market creation to proceed even if check fails
  // The on-chain transaction will fail if user doesn't have permission
  try {
    const checkRoles = await checkOperatorRoles(
      program,
      program.provider.publicKey
    );

    if (!checkRoles.data.market) {
      console.warn(
        `Wallet ${program.provider.publicKey} may not have operator role. Market creation will be attempted anyway.`
      );
    }
  } catch (error) {
    console.warn("Could not check operator roles:", error);
    // Continue anyway - let the on-chain transaction handle the permission check
  }

  // Generate a publicKey to represent the event
  const eventAccountKeyPair = Keypair.generate();
  const eventPk = eventAccountKeyPair.publicKey;

  const marketLock = Date.parse(lockTimestamp) / 1000; // lockTimestamp in seconds
  const type = MarketType.EventResultWinner;
  const outcomes = ["Yes", "No"];
  const batchSize = 50;

  console.log(`Creating market ⏱`);
  const marketResponse = await createMarket(
    program,
    marketName,
    type,
    usdcMint,
    marketLock,
    eventPk
  );
  // returns CreateMarketResponse: market account public key, creation transaction id, and market account
  logResponse(marketResponse);
  if (marketResponse.success) {
    console.log(
      `MarketAccount ${marketResponse.data.marketPk.toString()} created ✅`
    );
    console.log(`TransactionId: ${marketResponse.data.tnxId}`);
    setCreateStatus(CreateStatus.InitialisingOutcomes);
  } else {
    console.log("Error creating market");
    return;
  }

  const marketPk = marketResponse.data.marketPk;

  console.log(`Initialising market outcomes ⏱`);
  const initialiseOutcomePoolsResponse = await initialiseOutcomes(
    program,
    marketPk,
    outcomes
  );
  // returns OutcomeInitialisationsResponse: list of outcomes, their pdas, and transaction id
  logResponse(initialiseOutcomePoolsResponse);
  if (initialiseOutcomePoolsResponse.success) {
    console.log(`Outcomes added to market ✅`);
    setCreateStatus(CreateStatus.AddingPrices);
  } else {
    console.log("Error initialising outcomes");
    return;
  }

  console.log(`Adding prices to outcomes ⏱`);
  const addPriceLaddersResponse = await batchAddPricesToAllOutcomePools(
    program,
    marketPk,
    PRICE_LADDER,
    batchSize
  );
  // returns BatchAddPricesToOutcomeResponse: transaction id, and confirmation
  logResponse(addPriceLaddersResponse);
  if (addPriceLaddersResponse.success) {
    console.log(`Prices added to outcomes ✅`);
  } else {
    console.log("Error adding prices to outcomes");
    return;
  }

  console.log(`Market ${marketPk.toString()} creation complete ✨`);
  return marketResponse.data.marketPk;
}

export const CreateMarketModal = () => {
  // Get program from context without throwing if not loaded
  const programFromContext = useContext(ProgramContext);
  const { publicKey, connected } = useWallet();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [marketPk, setMarketPk] = useState<PublicKey>();
  const [createStatus, setCreateStatus] = useState<CreateStatus>(
    CreateStatus.CreatingMarket
  );
  let duration = 0.5;

  // Debug logging
  React.useEffect(() => {
    console.log("CreateMarketModal - Program state:", {
      hasProgram: !!programFromContext,
      hasProvider: !!programFromContext?.provider,
      hasPublicKey: !!publicKey,
      connected,
      programId: process.env.NEXT_PUBLIC_PROGRAM_ID,
    });
  }, [programFromContext, publicKey, connected]);

  async function addMarket(values) {
    const {
      title,
      category,
      lockTimestamp,
      description,
      resolutionSource,
      resolutionValue,
      oracleSymbol,
      ticker,
      tag,
    } = values;

    // Use program from context, not from form values
    const program = programFromContext;
    
    // Validate program is available
    if (!program || !program.provider) {
      throw new Error("Program not initialized. Please ensure your wallet is connected and the program is loaded.");
    }

    if (!publicKey) {
      throw new Error("Wallet not connected. Please connect your wallet to create a market.");
    }

    try {
      const marketPk = await createVerboseMarket(
        program,
        title,
        lockTimestamp,
        setCreateStatus
      );
      if (!marketPk) {
        throw new Error("Error creating market");
      }
      // Set market status from 'initializing' to 'open'
      setCreateStatus(CreateStatus.OpeningMarket);
      await openMarket(program, marketPk);
      // Get market creation timestamp
      const marketCreateTimestamp = (new Date().getTime() / 1000).toString(16);

      // Market make
      // setCreateStatus(CreateStatus.MakingMarket);
      // await marketMake(program, marketPk);

      // Get price data
      const priceData = await getPriceData(program, marketPk);
      // Get market account
      const market = await getMarket(program, marketPk!);
      const marketAccount = market.data;

      // Add accounts to database
      const data = {
        category,
        description,
        tag,
        resolutionSource,
        resolutionValue,
        oracleSymbol,
        ticker,
        marketCreateTimestamp,
        marketAccount,
        priceData,
      };
      await fetch("../api/createMarket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      setIsSuccess(true);
      setCreateStatus(CreateStatus.Success);
      setMarketPk(marketPk);
    } catch (error: any) {
      setIsSuccess(false);
      console.log("addMarket", error);
      // Show user-friendly error message
      const errorMessage = error?.message || "Failed to create market";
      if (errorMessage.includes("operator role")) {
        throw new Error(
          "You don't have permission to create markets. Please contact an administrator to grant you the operator role."
        );
      }
      throw error;
    }
  }

  const validationSchema = yup.object().shape({
    title: yup.string().required("Market title is required"),
    category: yup.string().required("Market category is required"),
    lockTimestamp: yup
      .date()
      .min(new Date(), "Resolution date must be in the future")
      .required(),
    description: yup.string().required("Resolution criteria is required"),
    resolutionSource: yup.string(),
    tag: yup.string(),
    ticker: yup.string(),
    oracleSymbol: yup.string(),
    resolutionValue: yup.string(),
  });

  return (
    <MotionConfig transition={{ duration, type: "tween" }}>
      <ModalOverlay backdropFilter="auto" backdropBlur="5px" />
      <Formik
        initialValues={{
          title: "",
          category: "",
          lockTimestamp: "",
          description: "",
          tag: "",
          resolutionSource: "",
          ticker: "",
          oracleSymbol: "",
          resolutionValue: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, actions) => {
          // Check program and wallet before proceeding
          if (!programFromContext || !programFromContext.provider) {
            actions.setStatus({
              error: "Program not loaded. Please ensure your wallet is connected and wait a moment.",
            });
            return;
          }

          if (!publicKey) {
            actions.setStatus({
              error: "Wallet not connected. Please connect your wallet to create a market.",
            });
            return;
          }

          try {
            await addMarket(values);
          } catch (error: any) {
            // Error is already handled in addMarket, but we can set form errors here
            actions.setStatus({
              error: error?.message || "Failed to create market. Please try again.",
            });
          }
        }}
      >
        {(props) => (
          <ModalContent
            border={"1px solid rgb(255, 255, 255, 0.12)"}
            maxW={"500px"}
            p={"12px 15px"}
            rounded={"2xl"}
            boxShadow={"2xl"}
            // eslint-disable-next-line react-hooks/rules-of-hooks
            bg={
              isSuccess
                ? mode("rgb(64,40,249,0.85)", "rgb(64,40,220,0.9)")
                : mode("rgb(255,255,255)", "rgb(17, 25, 40, 0.9)")
            }
            backdropFilter={{ md: "blur(7px)" }}
          >
            <ModalCloseButton
              color={isSuccess ? "gray.50" : mode("gray.700", "gray.100")}
              m={"10px auto"}
              rounded={"xl"}
              size={"lg"}
              isDisabled={props.isSubmitting}
            />

            <ModalBody className={styles.modal_container}>
              {!publicKey ? (
                <Box m="10px auto" p={8} textAlign="center">
                  <Text color={mode("gray.700", "gray.300")}>
                    Please connect your wallet to create a market.
                  </Text>
                </Box>
              ) : !programFromContext || !programFromContext.provider ? (
                <Box m="10px auto" p={8} textAlign="center">
                  <Text color={mode("gray.700", "gray.300")} mb={2}>
                    Loading program...
                  </Text>
                  <Text color={mode("gray.500", "gray.400")} fontSize="sm">
                    Please wait while the program initializes. This may take a few seconds.
                  </Text>
                  {!process.env.NEXT_PUBLIC_PROGRAM_ID && (
                    <Text color="red.500" fontSize="xs" mt={2}>
                      Warning: NEXT_PUBLIC_PROGRAM_ID is not configured.
                    </Text>
                  )}
                </Box>
              ) : (
                <Box m="10px auto">
                  <ResizablePanel>
                    <FormStepper
                      success={isSuccess}
                      marketPk={marketPk}
                      {...props}
                    >
                      <Form1 />
                      <Form2 title={props.values.title} />
                      <SubmittedForm
                        publicKey={marketPk}
                        success={isSuccess}
                        isSubmitting={props.isSubmitting}
                        status={createStatus}
                        formStatus={props.status}
                      />
                    </FormStepper>
                  </ResizablePanel>
                </Box>
              )}
            </ModalBody>
          </ModalContent>
        )}
      </Formik>
    </MotionConfig>
  );
};
