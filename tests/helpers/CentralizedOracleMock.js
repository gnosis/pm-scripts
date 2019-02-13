import CentralizedOracle from '../../src/oracles/centralizedOracle'

import bs58 from 'bs58' // base58
import crypto from 'crypto'


class CentralizedOracleMock extends CentralizedOracle {

    async publishEventDescription () {
        const data = JSON.stringify(this._eventDescription)
        
        const hashFunction = Buffer.from('12', 'hex') // 0x20
        const digest = crypto.createHash('sha256').update(data).digest()
        const digestSize = Buffer.from(digest.byteLength.toString(16), 'hex')
        // sha2-256   size  sha2-256(data)
        const combinedHashes = Buffer.concat([hashFunction, digestSize, digest])
        // Encode to base58
        const encodedHash = bs58.encode(combinedHashes)
        this._ipfsHash = encodedHash.toString()
      }

}

module.exports = CentralizedOracleMock