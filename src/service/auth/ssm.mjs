import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const clientsecret = new SecretsManagerClient();

export async function getSecret() {
    try {
        // Fetch the JWT secret string from AWS Secrets Manager
        const secret_value = await clientsecret.send(new GetSecretValueCommand({
            SecretId: "JWTUserTokenSecret", // SecretName from template.yaml
        }));

        // Parse the SecretString (it may contain JSON, so we need to parse it)
        const secretString = secret_value.SecretString;

        if (secretString) {
            // If SecretString is a valid JSON, parse it
            const secretObject = JSON.parse(secretString);
            // Access the 'jwt_secret' value from the secret's JSON
            return secretObject.jwt_secret;
        } else {
            console.log("Secret not found or invalid response.");
            return null;
        }
    } catch (error) {
        console.error('Error retrieving secret:', error);
        throw error; // Optionally rethrow or handle the error
    }
}