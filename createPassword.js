let password = "yourSecretPassword";
let hash = require("crypto")
	.createHash("SHA512")
	.update(password)
	.digest("hex");

console.log(hash);
