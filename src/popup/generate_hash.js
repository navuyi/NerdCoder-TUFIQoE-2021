const generateHash = async (plain_text, algorithm) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain_text)

    const hash = await crypto.subtle.digest(algorithm, data)
    const hashArray = Array.from(new Uint8Array(hash));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string

    return hashHex
}

export default generateHash