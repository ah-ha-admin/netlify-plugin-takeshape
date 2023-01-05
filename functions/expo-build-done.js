const fetch = require("node-fetch")
const crypto = require('crypto')
const safeCompare = require('safe-compare')


exports.handler = async event => {
	console.log({event})
	const expoSignature = event.headers['expo-signature']
	const hmac = crypto.createHmac('sha1', process.env.EXPO_WEBHOOK_SECRET)
	hmac.update(event.body)
	const hash = `sha1=${hmac.digest('hex')}`

	console.log({hash, expoSignature})
	if (!safeCompare(expoSignature, hash)) {
		return {
			status: 500,
			body: "Signatures didn't match!",
		}
	}

	console.log({event})
	const {status} = event.body
	if (status === "finished") {
		await fetch("https://api.github.com/repos/pvinis/batler/dispatches", {
			method: "POST",
			headers: {
				"Authorization": `token ${process.env.GITHUB_TOKEN}`,
			},
			body: JSON.stringify({
				"event_type": "expo_build_done",
			})
		})
	}

	return { statusCode: 200 }
}
