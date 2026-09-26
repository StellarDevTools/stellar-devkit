const StellarSdk = require('@stellar/stellar-sdk');

const source = StellarSdk.Keypair.random();
const dest = StellarSdk.Keypair.random();
const account = new StellarSdk.Account(source.publicKey(), '100');

const tx = new StellarSdk.TransactionBuilder(account, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.TESTNET
})
.addOperation(StellarSdk.Operation.payment({
  destination: dest.publicKey(),
  asset: StellarSdk.Asset.native(),
  amount: '10'
}))
.addMemo(StellarSdk.Memo.text('Test'))
.setTimeout(30)
.build();

console.log('XDR:', tx.toXDR());
console.log('Source:', source.publicKey());
console.log('Dest:', dest.publicKey());
