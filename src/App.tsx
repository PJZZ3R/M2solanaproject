// importfunctionalities
import './App.css';
import {
  PublicKey,
  Transaction,
  clusterApiUrl,
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
    sendAndConfirmTransaction
  

} from "@solana/web3.js";
import {useEffect , useState } from "react";
window.Buffer = window.Buffer || require("buffer").Buffer;

 
// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}
//define other variables

// Initialize the object to store the Phantom provider information
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * finds the phantom provider
 */
 const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

function App() {
  // create state variable for the provider
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );
  //State variables for generated keypair
  var [newPair, setNewPair] = useState<Keypair | undefined>(undefined);
  var [pPK, setpPK] = useState(''); 
  var newPubKeyStr;
  var pubKeyTest;
	// create state variable for the wallet key
  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(
  undefined
  );
 

  // this is the function that runs whenever the component updates (e.g. render, refresh)
  useEffect(() => {
	  const provider = getProvider();

		// if the phantom provider exists, set this as the provider
	  if (provider) setProvider(provider);
	  else setProvider(undefined);
  }, []);

    // Function for generating new keypair to bind to the first button
  const generatePair = async () => {
    // Import Solana web3 functionalities
    const {
    PublicKey,
    Keypair,
        } = require("@solana/web3.js");

    // Create a new keypair
    const newKPair = new Keypair();
    
    
    const pKey = newKPair.publicKey.toString();
    pubKeyTest = pKey;
    setNewPair(newKPair);
    console.log("new keypair generated", newKPair)
  
  }
   
  const airdropSol = async () => {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
       // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(newPair.publicKey),
        2000000000
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

 

      let fromBalance = await connection.getBalance(new PublicKey(newPair.publicKey)); 
      console.log("Balance:", fromBalance/LAMPORTS_PER_SOL)
          };

    
        
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

		// checks if phantom wallet exists
    if (solana) {
      try {
				// connects wallet and returns response which includes the wallet public key
        const response = await solana.connect();
        setpPK(response.publicKey)
        console.log('wallet account ', response.publicKey.toString());
				// update walletKey to be the public key
        setWalletKey(response.publicKey.toString());
        console.log(newPair)
        console.log(response.publicKey)
      } catch (err) {
        
      // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  // send SOL from generated keypair to connected phantom wallet
  const transfer = async() => {
    // @ts-ignore
    const { solana } = window;

    // check for phantom wallet
    if (solana) {
    const pWallet = await solana.connect();
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    var transaction = new Transaction().add(
    SystemProgram.transfer({
        fromPubkey: newPair.publicKey,
        toPubkey: pWallet.publicKey,
        lamports: 1990000000
    })
);
      // Sign transaction
      console.log(newPair)
         var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [newPair]
         
    
);
         }
console.log('Signature is ', signature);
}
  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

		// checks if phantom wallet exists
    if (solana && walletKey) {
      try {
				// connects wallet and returns response which includes the wallet public key
         await solana.disconnect();
         setWalletKey(undefined);
      } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };
 
 
  


	// HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
        <h2>Generate New Keypair</h2>
      </header>
                <button
            style={{
              fontSize: "16px",
              padding: "20px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={generatePair}
          >
            Generate New Keypair
          </button>
          <header className="App-header">
        <h2>Airdrop SOL</h2>
      </header>
                <button
            style={{
              fontSize: "16px",
              padding: "20px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={airdropSol}
          >
            Airdrop SOL
          </button>
    
      <header className="App-header">
        <h2>Connect to Phantom Wallet</h2>
      </header>
      {provider && !walletKey && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        {provider && walletKey && <p>Connected account: {walletKey.toString()}  </p> }

        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
        <header className="App-header">
        <h2>Transfer</h2>
      </header>
                <button
            style={{
              fontSize: "16px",
              padding: "20px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={transfer}
          >
            Transfer SOL
          </button>
        <header className="App-header">
        <h2>Disconnect Wallet</h2>
      </header>
      {provider && walletKey && <p>Connected account: {walletKey.toString()}  </p> }
          <button
            style={{
              fontSize: "16px",
              padding: "20px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={disconnectWallet}
          >
            Disconnect Wallet
          </button>
        
          {provider && !walletKey && (

        !provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )
          )
        }
    </div>
    
  );
}

export default App;
