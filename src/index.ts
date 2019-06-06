import {claimsMetadata, JolocomLib} from 'jolocom-lib'
import {IVaultedKeyProvider, KeyTypes} from 'jolocom-lib/js/vaultedKeyProvider/types'

async function getIdentityWallet(vault: IVaultedKeyProvider, pass: string) {
  return await registry.authenticate(vault, {
    derivationPath: KeyTypes.jolocomIdentityKey,
    encryptionPass: pass
  })
}

async function createIdentity(vault: IVaultedKeyProvider, pass: string) {
  const publicKey = vault.getPublicKey({
    derivationPath: KeyTypes.ethereumKey,
    encryptionPass: pass
  })

  await JolocomLib.util.fuelKeyWithEther(publicKey)
  await JolocomLib.util.fuelKeyWithEther(publicKey)

  return await registry.create(vault, pass)
}


async function getPublicProfile(vault: IVaultedKeyProvider, pass: string) {
  const identityWallet = await getIdentityWallet(vault, pass)
  return identityWallet.identity.publicProfile
}

async function addPublicProfile(vault: IVaultedKeyProvider, pass: string) {
  const identityWallet = await getIdentityWallet(vault, pass)

  /** @dev fueling just in case */
  const publicKey = vault.getPublicKey(({
    derivationPath: KeyTypes.ethereumKey,
    encryptionPass: PASS
  }))

  await JolocomLib.util.fuelKeyWithEther(publicKey)

  const profile = await identityWallet.create.signedCredential({
    metadata: claimsMetadata.publicProfile,
    claim: {
      name: 'Jolocom',
      description: 'Example profile description',
      url: 'https://example.com',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Pluto_in_True_Color_-_High-Res.jpg/440px-Pluto_in_True_Color_-_High-Res.jpg'

    },
    subject: identityWallet.did
  }, PASS)

  identityWallet.identity.publicProfile = profile

  return await registry.commit({
    identityWallet: identityWallet,
    vaultedKeyProvider: vault,
    keyMetadata: {
      encryptionPass: PASS,
      derivationPath: KeyTypes.ethereumKey
    }
  })
}

async function generateCredentialOffer(vault: IVaultedKeyProvider, pass: string) {
  const identityWallet = await getIdentityWallet(vault, pass)

  return await identityWallet.create.interactionTokens.request.offer({
    callbackURL: 'https://demo.com/offer',
    offeredCredentials: [{
      type: 'ProofOfDemoIdCredential',
      metadata: {
        asynchronous: false // Currently Unused
      },
      renderInfo: {
        renderAs: 'document',
        background: {
          url: '', // URL to jpg, png, gif
          color: '' // Hex encoded color, e.g. #ffffff (if url is present, the image will be rendered instead)
        },
        text: {
          color: '' // Hex encoded color, e.g. #ffffff (allows for high contrast on font)
        },
        logo: {
          url: '' // URL to jpg, png, gif
        }
      },
      requestedInput: {} // Currently unused, awaiting standardization efforts
    }]
  }, pass)
}


const ENTROPY = Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff','hex')
const PASS = 'secret'

const vault = JolocomLib.KeyProvider.fromSeed(ENTROPY, PASS)
const registry = JolocomLib.registries.jolocom.create()

// createIdentity(vault, PASS)
// addPublicProfile(vault, PASS)
// getPublicProfile(vault, PASS).then(console.log)
// generateCredentialOffer(vault, PASS).then(console.log)
